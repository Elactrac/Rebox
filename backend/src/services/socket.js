const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

let io;
const userSockets = new Map(); // userId -> Set of socket ids

const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  // Authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication required'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.userId;
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.userId;
    console.log(`User ${userId} connected via socket ${socket.id}`);

    // Track user's socket
    if (!userSockets.has(userId)) {
      userSockets.set(userId, new Set());
    }
    userSockets.get(userId).add(socket.id);

    // Join user's personal room
    socket.join(`user:${userId}`);

    // Handle joining specific rooms
    socket.on('join:pickup', (pickupId) => {
      socket.join(`pickup:${pickupId}`);
      console.log(`User ${userId} joined pickup:${pickupId}`);
    });

    socket.on('leave:pickup', (pickupId) => {
      socket.leave(`pickup:${pickupId}`);
    });

    // Handle read receipts
    socket.on('notification:read', async (notificationId) => {
      // Emit to all user's devices
      io.to(`user:${userId}`).emit('notification:updated', {
        id: notificationId,
        isRead: true
      });
    });

    // Handle typing indicators for chat (future feature)
    socket.on('typing:start', (data) => {
      socket.to(`pickup:${data.pickupId}`).emit('typing', {
        userId,
        isTyping: true
      });
    });

    socket.on('typing:stop', (data) => {
      socket.to(`pickup:${data.pickupId}`).emit('typing', {
        userId,
        isTyping: false
      });
    });

    socket.on('disconnect', () => {
      console.log(`User ${userId} disconnected from socket ${socket.id}`);
      const sockets = userSockets.get(userId);
      if (sockets) {
        sockets.delete(socket.id);
        if (sockets.size === 0) {
          userSockets.delete(userId);
        }
      }
    });
  });

  return io;
};

// Helper functions to emit events

// Send notification to specific user
const sendToUser = (userId, event, data) => {
  if (io) {
    io.to(`user:${userId}`).emit(event, data);
  }
};

// Send pickup update to all participants
const sendPickupUpdate = (pickupId, event, data) => {
  if (io) {
    io.to(`pickup:${pickupId}`).emit(event, data);
  }
};

// Broadcast to all connected users
const broadcast = (event, data) => {
  if (io) {
    io.emit(event, data);
  }
};

// Check if user is online
const isUserOnline = (userId) => {
  return userSockets.has(userId) && userSockets.get(userId).size > 0;
};

// Notification types
const NotificationTypes = {
  // Pickup related
  PICKUP_SCHEDULED: 'pickup:scheduled',
  PICKUP_CONFIRMED: 'pickup:confirmed',
  PICKUP_IN_TRANSIT: 'pickup:in_transit',
  PICKUP_COMPLETED: 'pickup:completed',
  PICKUP_CANCELLED: 'pickup:cancelled',
  
  // Reward related
  REWARD_EARNED: 'reward:earned',
  LEVEL_UP: 'reward:level_up',
  
  // Offer related
  OFFER_RECEIVED: 'offer:received',
  OFFER_ACCEPTED: 'offer:accepted',
  OFFER_REJECTED: 'offer:rejected',
  
  // System
  SYSTEM_ANNOUNCEMENT: 'system:announcement'
};

// High-level notification sender
const sendNotification = async (userId, type, data, prisma) => {
  // Create notification in database
  const notification = await prisma.notification.create({
    data: {
      userId,
      title: data.title,
      message: data.message,
      type: type.split(':')[0].toUpperCase(),
      data: data.metadata || {}
    }
  });

  // Send real-time notification
  sendToUser(userId, 'notification:new', {
    ...notification,
    realtime: true
  });

  return notification;
};

module.exports = {
  initializeSocket,
  sendToUser,
  sendPickupUpdate,
  broadcast,
  isUserOnline,
  NotificationTypes,
  sendNotification,
  getIO: () => io
};
