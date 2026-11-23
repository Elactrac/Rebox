// Test setup file
// Route tests mock @prisma/client themselves, so no real DB connection is opened here.

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key';
