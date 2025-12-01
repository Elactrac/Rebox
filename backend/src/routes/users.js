const express = require('express');
const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', authenticate, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        rewards: true,
        impactStats: true,
        _count: {
          select: {
            packages: true,
            pickupsAsUser: true
          }
        }
      }
    });

    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      data: userWithoutPassword
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get profile' 
    });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', authenticate, [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('phone').optional().trim(),
  body('address').optional().trim(),
  body('city').optional().trim(),
  body('state').optional().trim(),
  body('zipCode').optional().trim(),
  body('companyName').optional().trim(),
  body('businessType').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const allowedFields = [
      'name', 'phone', 'address', 'city', 'state', 
      'zipCode', 'country', 'companyName', 'businessType', 'avatar'
    ];

    const updateData = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: updateData,
      include: {
        rewards: true,
        impactStats: true
      }
    });

    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: userWithoutPassword
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update profile' 
    });
  }
});

// @route   GET /api/users/recyclers
// @desc    Get available recyclers (for pickup assignment)
// @access  Private
router.get('/recyclers', authenticate, async (req, res) => {
  try {
    const { city, state } = req.query;

    const where = { role: 'RECYCLER' };
    if (city) where.city = city;
    if (state) where.state = state;

    const recyclers = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        companyName: true,
        city: true,
        state: true,
        _count: {
          select: {
            pickupsAsRecycler: {
              where: { status: 'COMPLETED' }
            }
          }
        }
      }
    });

    res.json({
      success: true,
      data: recyclers
    });
  } catch (error) {
    console.error('Get recyclers error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get recyclers' 
    });
  }
});

// @route   GET /api/users/dashboard-stats
// @desc    Get dashboard statistics for user
// @access  Private
router.get('/dashboard-stats', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get counts and aggregates
    const [packages, pickups, rewards, impact] = await Promise.all([
      prisma.package.groupBy({
        by: ['status'],
        where: { userId },
        _count: { status: true }
      }),
      prisma.pickup.groupBy({
        by: ['status'],
        where: { userId },
        _count: { status: true }
      }),
      prisma.reward.findUnique({
        where: { userId }
      }),
      prisma.impactStats.findUnique({
        where: { userId }
      })
    ]);

    // Recent activity
    const recentPickups = await prisma.pickup.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        items: {
          include: { package: true }
        }
      }
    });

    res.json({
      success: true,
      data: {
        packageStats: packages,
        pickupStats: pickups,
        rewards,
        impact,
        recentPickups
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get dashboard stats' 
    });
  }
});

// @route   GET /api/users (Admin only)
// @desc    Get all users
// @access  Private/Admin
router.get('/', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const { page = 1, limit = 20, role, search } = req.query;
    const skip = (page - 1) * limit;

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
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isVerified: true,
          createdAt: true,
          _count: {
            select: {
              packages: true,
              pickupsAsUser: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
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
          pages: Math.ceil(total / limit)
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

module.exports = router;
