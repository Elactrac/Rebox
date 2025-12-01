// Test setup file
const { PrismaClient } = require('@prisma/client');

// Set test environment
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key';

const prisma = new PrismaClient();

// Clean up database before tests
beforeAll(async () => {
  // Optional: Clear test database
  // await prisma.$executeRaw`TRUNCATE TABLE "User" CASCADE`;
});

// Clean up after all tests
afterAll(async () => {
  await prisma.$disconnect();
});

// Global test utilities
global.testPrisma = prisma;
