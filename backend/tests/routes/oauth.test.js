const request = require('supertest');
const express = require('express');

jest.mock('@prisma/client', () => {
  const mockPrisma = {
    user: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };
  return { PrismaClient: jest.fn(() => mockPrisma) };
});

jest.mock('../../src/services/email', () => ({
  sendEmail: jest.fn().mockResolvedValue(true),
}));

jest.mock('../../src/services/oauth', () => ({
  verifyGoogleToken: jest.fn(),
  verifyGoogleCode: jest.fn(),
  getGoogleAuthUrl: jest.fn(() => 'https://accounts.google.com/o/oauth2/v2/auth'),
  getOAuthConfig: jest.fn(() => ({ google: { enabled: true } })),
}));

// Authenticated as whichever user the test puts in mockCurrentUser
let mockCurrentUser = null;
jest.mock('../../src/middleware/auth', () => ({
  authenticate: (req, res, next) => {
    if (!mockCurrentUser) return res.status(401).json({ success: false });
    req.user = mockCurrentUser;
    next();
  },
  authorize: () => (req, res, next) => next(),
}));

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { verifyGoogleCode } = require('../../src/services/oauth');
const { clearAllRateLimits } = require('../../src/middleware/rateLimiter');
const oauthRoutes = require('../../src/routes/oauth');
const userRoutes = require('../../src/routes/users');

const app = express();
app.use(express.json());
app.use((req, res, next) => { req.prisma = prisma; next(); });
app.use('/api/oauth', oauthRoutes);
app.use('/api/users', userRoutes);

const googleUser = {
  email: 'new@example.com',
  name: 'New User',
  avatar: null,
  providerId: 'g-123',
  providerData: {},
  isVerified: true,
};

beforeEach(() => {
  jest.clearAllMocks();
  clearAllRateLimits();
  mockCurrentUser = null;
});

describe('POST /api/oauth/google/code', () => {
  beforeEach(() => {
    verifyGoogleCode.mockResolvedValue(googleUser);
    prisma.user.findFirst.mockResolvedValue(null);
    prisma.user.create.mockImplementation(({ data }) =>
      Promise.resolve({ id: 'u1', ...data, createdAt: new Date(), updatedAt: new Date() })
    );
  });

  it('creates the account with the role chosen on the register page', async () => {
    const res = await request(app)
      .post('/api/oauth/google/code')
      .send({ code: 'c', role: 'BUSINESS' });

    expect(res.status).toBe(200);
    expect(prisma.user.create.mock.calls[0][0].data.role).toBe('BUSINESS');
    expect(res.body.data.isNewUser).toBe(true);
    expect(res.body.data.needsRole).toBe(false);
  });

  it('asks for a role when none was chosen (login page sign-up)', async () => {
    const res = await request(app).post('/api/oauth/google/code').send({ code: 'c' });

    expect(prisma.user.create.mock.calls[0][0].data.role).toBe('INDIVIDUAL');
    expect(res.body.data.needsRole).toBe(true);
  });

  it('never creates an ADMIN from a client-supplied role', async () => {
    const res = await request(app)
      .post('/api/oauth/google/code')
      .send({ code: 'c', role: 'ADMIN' });

    expect(prisma.user.create.mock.calls[0][0].data.role).toBe('INDIVIDUAL');
    expect(res.body.data.needsRole).toBe(true);
  });
});

describe('POST /api/oauth/role', () => {
  const freshGoogleUser = {
    id: 'u1',
    provider: 'google',
    role: 'INDIVIDUAL',
    createdAt: new Date(),
  };

  it('lets a freshly signed-up Google user pick their account type', async () => {
    mockCurrentUser = { id: 'u1' };
    prisma.user.findUnique.mockResolvedValue(freshGoogleUser);
    prisma.user.update.mockResolvedValue({ ...freshGoogleUser, role: 'RECYCLER' });

    const res = await request(app).post('/api/oauth/role').send({ role: 'RECYCLER' });

    expect(res.status).toBe(200);
    expect(prisma.user.update.mock.calls[0][0].data).toEqual({ role: 'RECYCLER' });
  });

  it('rejects ADMIN', async () => {
    mockCurrentUser = { id: 'u1' };
    const res = await request(app).post('/api/oauth/role').send({ role: 'ADMIN' });

    expect(res.status).toBe(400);
    expect(prisma.user.update).not.toHaveBeenCalled();
  });

  it('rejects accounts older than the sign-up window', async () => {
    mockCurrentUser = { id: 'u1' };
    prisma.user.findUnique.mockResolvedValue({
      ...freshGoogleUser,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    });

    const res = await request(app).post('/api/oauth/role').send({ role: 'BUSINESS' });

    expect(res.status).toBe(403);
    expect(prisma.user.update).not.toHaveBeenCalled();
  });

  it('rejects password (non-Google) accounts', async () => {
    mockCurrentUser = { id: 'u1' };
    prisma.user.findUnique.mockResolvedValue({ ...freshGoogleUser, provider: null });

    const res = await request(app).post('/api/oauth/role').send({ role: 'BUSINESS' });

    expect(res.status).toBe(403);
  });

  it('requires authentication', async () => {
    const res = await request(app).post('/api/oauth/role').send({ role: 'BUSINESS' });
    expect(res.status).toBe(401);
  });
});

describe('POST /api/oauth/unlink', () => {
  it('works for a logged-in user (previously always returned 401)', async () => {
    mockCurrentUser = { id: 'u1' };
    prisma.user.findUnique.mockResolvedValue({ id: 'u1', password: 'hash' });
    prisma.user.update.mockResolvedValue({ id: 'u1', provider: null });

    const res = await request(app).post('/api/oauth/unlink');

    expect(res.status).toBe(200);
  });
});

describe('PUT /api/users/profile', () => {
  it('ignores attempts to change role (privilege escalation)', async () => {
    mockCurrentUser = { id: 'u1', role: 'INDIVIDUAL' };
    prisma.user.update.mockResolvedValue({ id: 'u1', name: 'X', role: 'INDIVIDUAL' });

    const res = await request(app)
      .put('/api/users/profile')
      .send({ name: 'X', role: 'ADMIN' });

    expect(res.status).toBe(200);
    expect(prisma.user.update.mock.calls[0][0].data).toEqual({ name: 'X' });
  });
});
