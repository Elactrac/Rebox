const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate, authorize } = require('../middleware/auth');
const cache = require('../services/cache');

const router = express.Router();
const prisma = new PrismaClient();

// @route   GET /api/admin/stats
// @desc    Get admin dashboard statistics
// @access  Private (Admin only)
router.get('/stats', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const [
      totalUsers,
      totalPackages,
      totalPickups,
      totalTransactions,
      usersByRole,
      pickupsByStatus,
      packagesByType,
      recentSignups,
      recentPickups
    ] = await Promise.all([
      prisma.user.count(),
      prisma.package.count(),
      prisma.pickup.count(),
      prisma.transaction.count(),
      prisma.user.groupBy({
        by: ['role'],
        _count: { id: true }
      }),
      prisma.pickup.groupBy({
        by: ['status'],
        _count: { id: true }
      }),
      prisma.package.groupBy({
        by: ['type'],
        _count: { id: true },
        _sum: { estimatedValue: true }
      }),
      prisma.user.count({
        where: {
          createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        }
      }),
      prisma.pickup.count({
        where: {
          createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        }
      })
    ]);

    // Calculate totals
    const impactTotals = await prisma.impactStats.aggregate({
      _sum: {
        co2Saved: true,
        waterSaved: true,
        landfillDiverted: true,
        totalPackages: true,
        totalWeight: true
      }
    });

    const rewardTotals = await prisma.reward.aggregate({
      _sum: {
        lifetimePoints: true,
        availablePoints: true
      }
    });

    const completedPickups = await prisma.pickup.aggregate({
      where: { status: 'COMPLETED' },
      _sum: { totalValue: true, rewardPoints: true },
      _count: { id: true }
    });

    res.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalPackages,
          totalPickups,
          totalTransactions,
          recentSignups,
          recentPickups
        },
        users: {
          byRole: usersByRole.reduce((acc, item) => {
            acc[item.role] = item._count.id;
            return acc;
          }, {})
        },
        pickups: {
          byStatus: pickupsByStatus.reduce((acc, item) => {
            acc[item.status] = item._count.id;
            return acc;
          }, {}),
          completed: completedPickups
        },
        packages: {
          byType: packagesByType
        },
        impact: {
          co2Saved: impactTotals._sum.co2Saved || 0,
          waterSaved: impactTotals._sum.waterSaved || 0,
          landfillDiverted: impactTotals._sum.landfillDiverted || 0,
          totalPackages: impactTotals._sum.totalPackages || 0,
          totalWeight: impactTotals._sum.totalWeight || 0
        },
        rewards: {
          totalPointsIssued: rewardTotals._sum.lifetimePoints || 0,
          availablePoints: rewardTotals._sum.availablePoints || 0
        }
      }
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get admin stats' 
    });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users with pagination
// @access  Private (Admin only)
router.get('/users', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const { page = 1, limit = 20, role, search, sortBy = 'createdAt', order = 'desc' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (role) where.role = role;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { [sortBy]: order },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isVerified: true,
          createdAt: true,
          city: true,
          state: true,
          rewards: {
            select: { totalPoints: true, level: true }
          },
          impactStats: {
            select: { totalPackages: true, co2Saved: true }
          },
          _count: {
            select: { packages: true, pickupsAsUser: true }
          }
        }
      }),
      prisma.user.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get users' 
    });
  }
});

// @route   GET /api/admin/users/:id
// @desc    Get user details
// @access  Private (Admin only)
router.get('/users/:id', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      include: {
        rewards: true,
        impactStats: true,
        packages: { take: 10, orderBy: { createdAt: 'desc' } },
        pickupsAsUser: { take: 10, orderBy: { createdAt: 'desc' } },
        transactions: { take: 10, orderBy: { createdAt: 'desc' } },
        _count: {
          select: { packages: true, pickupsAsUser: true, transactions: true }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    const { password, resetToken, resetExpires, verifyToken, verifyExpires, ...userData } = user;

    res.json({
      success: true,
      data: userData
    });
  } catch (error) {
    console.error('Get user details error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get user details' 
    });
  }
});

// @route   PUT /api/admin/users/:id
// @desc    Update user (admin can change role, verify, etc.)
// @access  Private (Admin only)
router.put('/users/:id', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const { role, isVerified } = req.body;
    const updateData = {};

    if (role) updateData.role = role;
    if (typeof isVerified === 'boolean') updateData.isVerified = isVerified;

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isVerified: true
      }
    });

    res.json({
      success: true,
      message: 'User updated successfully',
      data: user
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update user' 
    });
  }
});

// @route   GET /api/admin/analytics/timeline
// @desc    Get timeline analytics data
// @access  Private (Admin only)
router.get('/analytics/timeline', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    let startDate;
    switch (period) {
      case '7d':
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    }

    // Get daily signups
    const signups = await prisma.user.groupBy({
      by: ['createdAt'],
      where: { createdAt: { gte: startDate } },
      _count: { id: true }
    });

    // Get daily pickups
    const pickups = await prisma.pickup.groupBy({
      by: ['createdAt'],
      where: { createdAt: { gte: startDate } },
      _count: { id: true }
    });

    // Get completed pickups with value
    const completedPickups = await prisma.pickup.findMany({
      where: {
        status: 'COMPLETED',
        completedAt: { gte: startDate }
      },
      select: {
        completedAt: true,
        totalValue: true,
        totalItems: true
      }
    });

    res.json({
      success: true,
      data: {
        period,
        startDate,
        signups,
        pickups,
        completedPickups
      }
    });
  } catch (error) {
    console.error('Analytics timeline error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get analytics' 
    });
  }
});

// @route   GET /api/admin/pickups
// @desc    Get all pickups for admin
// @access  Private (Admin only)
router.get('/pickups', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (status) where.status = status;

    const [pickups, total] = await Promise.all([
      prisma.pickup.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true, email: true } },
          recycler: { select: { id: true, name: true, companyName: true } },
          _count: { select: { items: true } }
        }
      }),
      prisma.pickup.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        pickups,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Admin get pickups error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get pickups' 
    });
  }
});

// @route   POST /api/admin/broadcast
// @desc    Send broadcast notification to all users
// @access  Private (Admin only)
router.post('/broadcast', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const { title, message } = req.body;

    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: 'Title and message are required'
      });
    }

    // Get all user IDs
    const users = await prisma.user.findMany({
      select: { id: true }
    });

    // Create notifications for all users
    await prisma.notification.createMany({
      data: users.map(user => ({
        userId: user.id,
        title,
        message,
        type: 'SYSTEM'
      }))
    });

    res.json({
      success: true,
      message: `Broadcast sent to ${users.length} users`
    });
  } catch (error) {
    console.error('Broadcast error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send broadcast' 
    });
  }
});

// @route   GET /api/admin/cache/stats
// @desc    Get cache statistics
// @access  Private (Admin only)
router.get('/cache/stats', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const stats = await cache.getStats();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Cache stats error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get cache stats' 
    });
  }
});

// @route   POST /api/admin/cache/clear
// @desc    Clear all cache
// @access  Private (Admin only)
router.post('/cache/clear', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    await cache.clear();
    res.json({
      success: true,
      message: 'Cache cleared successfully'
    });
  } catch (error) {
    console.error('Clear cache error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to clear cache' 
    });
  }
});

module.exports = router;
