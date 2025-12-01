const request = require('supertest');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Mock Prisma
jest.mock('@prisma/client', () => {
  const mockPrisma = {
    user: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn()
    },
    reward: {
      create: jest.fn()
    },
    impactStats: {
      create: jest.fn()
    },
    $transaction: jest.fn()
  };
  return { PrismaClient: jest.fn(() => mockPrisma) };
});

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Import app after mocking
const express = require('express');
const authRoutes = require('../../src/routes/auth');

// Create test app
const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

describe('Auth Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    const validUser = {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User'
    };

    it('should register a new user successfully', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue({
        id: 'user-123',
        email: validUser.email,
        name: validUser.name,
        role: 'INDIVIDUAL',
        isVerified: false,
        createdAt: new Date()
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send(validUser);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(validUser.email);
      expect(response.body.data.token).toBeDefined();
    });

    it('should reject registration with existing email', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'existing-user' });

      const response = await request(app)
        .post('/api/auth/register')
        .send(validUser);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Email already registered');
    });

    it('should reject registration with invalid email', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({ ...validUser, email: 'invalid-email' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should reject registration with short password', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({ ...validUser, password: '123' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should reject registration without name', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({ email: validUser.email, password: validUser.password });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/login', () => {
    const loginCredentials = {
      email: 'test@example.com',
      password: 'password123'
    };

    it('should login successfully with valid credentials', async () => {
      const hashedPassword = await bcrypt.hash(loginCredentials.password, 12);
      
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-123',
        email: loginCredentials.email,
        password: hashedPassword,
        name: 'Test User',
        role: 'INDIVIDUAL',
        isVerified: true,
        rewards: { totalPoints: 100 },
        impactStats: { co2Saved: 10 }
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginCredentials);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(loginCredentials.email);
      expect(response.body.data.token).toBeDefined();
      // Password should not be in response
      expect(response.body.data.user.password).toBeUndefined();
    });

    it('should reject login with wrong password', async () => {
      const hashedPassword = await bcrypt.hash('correctpassword', 12);
      
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-123',
        email: loginCredentials.email,
        password: hashedPassword,
        name: 'Test User'
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginCredentials);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid credentials');
    });

    it('should reject login with non-existent email', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginCredentials);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid credentials');
    });

    it('should reject login with invalid email format', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'invalid', password: 'password123' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/forgot-password', () => {
    it('should return success for existing email', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User'
      });
      prisma.user.update.mockResolvedValue({});

      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'test@example.com' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should return success for non-existing email (prevent enumeration)', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'nonexistent@example.com' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('POST /api/auth/verify-email', () => {
    it('should verify email with valid token', async () => {
      prisma.user.findFirst.mockResolvedValue({
        id: 'user-123',
        verifyToken: 'valid-token',
        verifyExpires: new Date(Date.now() + 3600000)
      });
      prisma.user.update.mockResolvedValue({});

      const response = await request(app)
        .post('/api/auth/verify-email')
        .send({ token: 'valid-token' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Email verified successfully');
    });

    it('should reject invalid/expired token', async () => {
      prisma.user.findFirst.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/auth/verify-email')
        .send({ token: 'invalid-token' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/reset-password', () => {
    it('should reset password with valid token', async () => {
      prisma.user.findFirst.mockResolvedValue({
        id: 'user-123',
        resetToken: 'valid-reset-token',
        resetExpires: new Date(Date.now() + 3600000)
      });
      prisma.user.update.mockResolvedValue({});

      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({ token: 'valid-reset-token', password: 'newpassword123' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should reject reset with invalid token', async () => {
      prisma.user.findFirst.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({ token: 'invalid-token', password: 'newpassword123' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should reject reset with short password', async () => {
      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({ token: 'valid-token', password: '123' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });
});
