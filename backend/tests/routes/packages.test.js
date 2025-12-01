const request = require('supertest');
const jwt = require('jsonwebtoken');

// Mock Prisma
jest.mock('@prisma/client', () => {
  const mockPrisma = {
    package: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn(),
      aggregate: jest.fn()
    }
  };
  return { PrismaClient: jest.fn(() => mockPrisma) };
});

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const express = require('express');
const packageRoutes = require('../../src/routes/packages');

// Mock auth middleware
jest.mock('../../src/middleware/auth', () => ({
  authenticate: (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      req.user = { id: 'user-123', role: 'INDIVIDUAL' };
      next();
    } else {
      res.status(401).json({ success: false, message: 'Unauthorized' });
    }
  },
  optionalAuth: (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      req.user = { id: 'user-123', role: 'INDIVIDUAL' };
    }
    next();
  }
}));

// Create test app
const app = express();
app.use(express.json());
app.use('/api/packages', packageRoutes);

describe('Package Routes', () => {
  const authToken = 'Bearer test-token';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/packages', () => {
    const validPackage = {
      type: 'BOX',
      condition: 'GOOD',
      quantity: 5,
      weight: 2.5,
      brand: 'Amazon',
      description: 'Moving boxes in good condition'
    };

    it('should create a new package successfully', async () => {
      prisma.package.create.mockResolvedValue({
        id: 'package-123',
        userId: 'user-123',
        ...validPackage,
        status: 'LISTED',
        estimatedValue: 2.0,
        co2Saved: 6.25,
        waterSaved: 37.5,
        createdAt: new Date()
      });

      const response = await request(app)
        .post('/api/packages')
        .set('Authorization', authToken)
        .send(validPackage);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.type).toBe('BOX');
      expect(response.body.data.estimatedValue).toBeDefined();
    });

    it('should reject package without authentication', async () => {
      const response = await request(app)
        .post('/api/packages')
        .send(validPackage);

      expect(response.status).toBe(401);
    });

    it('should reject invalid package type', async () => {
      const response = await request(app)
        .post('/api/packages')
        .set('Authorization', authToken)
        .send({ ...validPackage, type: 'INVALID' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should reject invalid condition', async () => {
      const response = await request(app)
        .post('/api/packages')
        .set('Authorization', authToken)
        .send({ ...validPackage, condition: 'INVALID' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/packages', () => {
    it('should return list of packages', async () => {
      const mockPackages = [
        { id: 'pkg-1', type: 'BOX', status: 'LISTED', user: { id: 'user-1', name: 'John' } },
        { id: 'pkg-2', type: 'BOTTLE', status: 'LISTED', user: { id: 'user-2', name: 'Jane' } }
      ];

      prisma.package.findMany.mockResolvedValue(mockPackages);
      prisma.package.count.mockResolvedValue(2);

      const response = await request(app)
        .get('/api/packages');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.packages).toHaveLength(2);
      expect(response.body.data.pagination).toBeDefined();
    });

    it('should filter packages by type', async () => {
      prisma.package.findMany.mockResolvedValue([
        { id: 'pkg-1', type: 'BOX', status: 'LISTED' }
      ]);
      prisma.package.count.mockResolvedValue(1);

      const response = await request(app)
        .get('/api/packages?type=BOX');

      expect(response.status).toBe(200);
      expect(prisma.package.findMany).toHaveBeenCalled();
    });

    it('should paginate results', async () => {
      prisma.package.findMany.mockResolvedValue([]);
      prisma.package.count.mockResolvedValue(100);

      const response = await request(app)
        .get('/api/packages?page=2&limit=10');

      expect(response.status).toBe(200);
      expect(response.body.data.pagination.page).toBe(2);
      expect(response.body.data.pagination.limit).toBe(10);
    });
  });

  describe('GET /api/packages/:id', () => {
    it('should return a specific package', async () => {
      prisma.package.findUnique.mockResolvedValue({
        id: 'package-123',
        type: 'BOX',
        condition: 'GOOD',
        status: 'LISTED',
        user: { id: 'user-123', name: 'Test User' },
        buybackOffers: []
      });

      const response = await request(app)
        .get('/api/packages/package-123');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('package-123');
    });

    it('should return 404 for non-existent package', async () => {
      prisma.package.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/packages/non-existent');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/packages/:id', () => {
    it('should update package successfully', async () => {
      prisma.package.findUnique.mockResolvedValue({
        id: 'package-123',
        userId: 'user-123',
        type: 'BOX',
        condition: 'GOOD',
        status: 'LISTED'
      });

      prisma.package.update.mockResolvedValue({
        id: 'package-123',
        type: 'BOX',
        condition: 'EXCELLENT',
        description: 'Updated description'
      });

      const response = await request(app)
        .put('/api/packages/package-123')
        .set('Authorization', authToken)
        .send({ condition: 'EXCELLENT', description: 'Updated description' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should reject update by non-owner', async () => {
      prisma.package.findUnique.mockResolvedValue({
        id: 'package-123',
        userId: 'other-user',
        status: 'LISTED'
      });

      const response = await request(app)
        .put('/api/packages/package-123')
        .set('Authorization', authToken)
        .send({ description: 'Trying to update' });

      expect(response.status).toBe(403);
    });

    it('should reject update of picked up package', async () => {
      prisma.package.findUnique.mockResolvedValue({
        id: 'package-123',
        userId: 'user-123',
        status: 'PICKED_UP'
      });

      const response = await request(app)
        .put('/api/packages/package-123')
        .set('Authorization', authToken)
        .send({ description: 'Trying to update' });

      expect(response.status).toBe(400);
    });
  });

  describe('DELETE /api/packages/:id', () => {
    it('should delete package successfully', async () => {
      prisma.package.findUnique.mockResolvedValue({
        id: 'package-123',
        userId: 'user-123',
        status: 'LISTED'
      });
      prisma.package.delete.mockResolvedValue({});

      const response = await request(app)
        .delete('/api/packages/package-123')
        .set('Authorization', authToken);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should reject delete of non-listed package', async () => {
      prisma.package.findUnique.mockResolvedValue({
        id: 'package-123',
        userId: 'user-123',
        status: 'SCHEDULED'
      });

      const response = await request(app)
        .delete('/api/packages/package-123')
        .set('Authorization', authToken);

      expect(response.status).toBe(400);
    });
  });
});
