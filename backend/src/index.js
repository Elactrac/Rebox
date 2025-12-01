require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');
const { PrismaClient } = require('@prisma/client');
const { initializeSocket } = require('./services/socket');
const { generalLimiter, burstLimiter, getRateLimitStats } = require('./middleware/rateLimiter');

// Import routes
const authRoutes = require('./routes/auth');
const oauthRoutes = require('./routes/oauth');
const userRoutes = require('./routes/users');
const packageRoutes = require('./routes/packages');
const pickupRoutes = require('./routes/pickups');
const rewardRoutes = require('./routes/rewards');
const impactRoutes = require('./routes/impact');
const notificationRoutes = require('./routes/notifications');
const buybackRoutes = require('./routes/buyback');
const uploadRoutes = require('./routes/upload');
const adminRoutes = require('./routes/admin');
const qrRoutes = require('./routes/qr');
const exportRoutes = require('./routes/export');

const app = express();
const server = http.createServer(app);
const prisma = new PrismaClient();

// Initialize Socket.io
const io = initializeSocket(server);

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply rate limiting
app.use(burstLimiter); // Prevent burst attacks
app.use('/api', generalLimiter); // General rate limiting for all API routes

// Serve static files (uploads)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Make prisma and io available to routes
app.use((req, res, next) => {
  req.prisma = prisma;
  req.io = io;
  next();
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'ReBox API is running', socketEnabled: true });
});

// Rate limit stats endpoint (admin only)
app.get('/api/admin/rate-limit-stats', (req, res) => {
  // Note: In production, add admin authentication here
  res.json({ success: true, data: getRateLimitStats() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/oauth', oauthRoutes);
app.use('/api/users', userRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/pickups', pickupRoutes);
app.use('/api/rewards', rewardRoutes);
app.use('/api/impact', impactRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/buyback', buybackRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/qr', qrRoutes);
app.use('/api/export', exportRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`ReBox server running on port ${PORT}`);
  console.log(`Socket.io enabled for real-time notifications`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  io.close();
  process.exit(0);
});

module.exports = { app, server, io };
