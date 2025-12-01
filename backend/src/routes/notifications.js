const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// @route   GET /api/notifications
// @desc    Get user's notifications
// @access  Private
router.get('/', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 20, unreadOnly } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = { userId: req.user.id };
    if (unreadOnly === 'true') where.isRead = false;

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({
        where: { userId: req.user.id, isRead: false }
      })
    ]);

    res.json({
      success: true,
      data: {
        notifications,
        unreadCount,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get notifications' 
    });
  }
});

// @route   PUT /api/notifications/:id/read
// @desc    Mark notification as read
// @access  Private
router.put('/:id/read', authenticate, async (req, res) => {
  try {
    const notification = await prisma.notification.findUnique({
      where: { id: req.params.id }
    });

    if (!notification) {
      return res.status(404).json({ 
        success: false, 
        message: 'Notification not found' 
      });
    }

    if (notification.userId !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized' 
      });
    }

    await prisma.notification.update({
      where: { id: req.params.id },
      data: { isRead: true }
    });

    res.json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    console.error('Mark read error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to mark notification as read' 
    });
  }
});

// @route   PUT /api/notifications/read-all
// @desc    Mark all notifications as read
// @access  Private
router.put('/read-all', authenticate, async (req, res) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user.id, isRead: false },
      data: { isRead: true }
    });

    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('Mark all read error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to mark notifications as read' 
    });
  }
});

// @route   DELETE /api/notifications/:id
// @desc    Delete a notification
// @access  Private
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const notification = await prisma.notification.findUnique({
      where: { id: req.params.id }
    });

    if (!notification) {
      return res.status(404).json({ 
        success: false, 
        message: 'Notification not found' 
      });
    }

    if (notification.userId !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized' 
      });
    }

    await prisma.notification.delete({
      where: { id: req.params.id }
    });

    res.json({
      success: true,
      message: 'Notification deleted'
    });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete notification' 
    });
  }
});

module.exports = router;
