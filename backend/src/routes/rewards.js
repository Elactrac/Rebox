const express = require('express');
const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Reward level thresholds
const REWARD_LEVELS = {
  Bronze: { min: 0, max: 999, multiplier: 1 },
  Silver: { min: 1000, max: 4999, multiplier: 1.25 },
  Gold: { min: 5000, max: 14999, multiplier: 1.5 },
  Platinum: { min: 15000, max: 49999, multiplier: 2 },
  Diamond: { min: 50000, max: Infinity, multiplier: 2.5 }
};

// Get level from points
const getLevelFromPoints = (lifetimePoints) => {
  for (const [level, config] of Object.entries(REWARD_LEVELS)) {
    if (lifetimePoints >= config.min && lifetimePoints <= config.max) {
      return level;
    }
  }
  return 'Bronze';
};

// @route   GET /api/rewards
// @desc    Get user's reward info
// @access  Private
router.get('/', authenticate, async (req, res) => {
  try {
    let reward = await prisma.reward.findUnique({
      where: { userId: req.user.id }
    });

    if (!reward) {
      reward = await prisma.reward.create({
        data: {
          userId: req.user.id,
          totalPoints: 0,
          availablePoints: 0,
          lifetimePoints: 0,
          level: 'Bronze'
        }
      });
    }

    // Get next level info
    const currentLevelConfig = REWARD_LEVELS[reward.level];
    const levels = Object.keys(REWARD_LEVELS);
    const currentIndex = levels.indexOf(reward.level);
    const nextLevel = currentIndex < levels.length - 1 ? levels[currentIndex + 1] : null;
    const nextLevelConfig = nextLevel ? REWARD_LEVELS[nextLevel] : null;

    res.json({
      success: true,
      data: {
        ...reward,
        currentLevelConfig,
        nextLevel,
        nextLevelConfig,
        pointsToNextLevel: nextLevelConfig ? nextLevelConfig.min - reward.lifetimePoints : 0
      }
    });
  } catch (error) {
    console.error('Get rewards error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get rewards' 
    });
  }
});

// @route   GET /api/rewards/transactions
// @desc    Get user's reward transactions
// @access  Private
router.get('/transactions', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 20, type } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = { userId: req.user.id };
    if (type) where.type = type;

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        skip,
        take: parseInt(limit),
        include: {
          pickup: {
            select: { trackingCode: true, scheduledDate: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.transaction.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        transactions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get transactions' 
    });
  }
});

// @route   POST /api/rewards/redeem
// @desc    Redeem reward points
// @access  Private
router.post('/redeem', authenticate, [
  body('points').isInt({ min: 100 }).withMessage('Minimum 100 points required'),
  body('rewardType').isIn(['CASH', 'GIFTCARD', 'DONATION']).withMessage('Invalid reward type')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const { points, rewardType, details } = req.body;

    const reward = await prisma.reward.findUnique({
      where: { userId: req.user.id }
    });

    if (!reward || reward.availablePoints < points) {
      return res.status(400).json({ 
        success: false, 
        message: 'Insufficient points' 
      });
    }

    // Calculate cash value (100 points = $1)
    const cashValue = points / 100;

    await prisma.$transaction(async (tx) => {
      // Deduct points
      await tx.reward.update({
        where: { userId: req.user.id },
        data: {
          availablePoints: { decrement: points }
        }
      });

      // Create redemption transaction
      await tx.transaction.create({
        data: {
          userId: req.user.id,
          type: 'REDEMPTION',
          points: -points,
          amount: cashValue,
          description: `Redeemed ${points} points for ${rewardType}: $${cashValue.toFixed(2)}`
        }
      });

      // Create notification
      await tx.notification.create({
        data: {
          userId: req.user.id,
          title: 'Points Redeemed',
          message: `Successfully redeemed ${points} points for $${cashValue.toFixed(2)}`,
          type: 'REWARD',
          data: { points, rewardType, cashValue }
        }
      });
    });

    res.json({
      success: true,
      message: 'Points redeemed successfully',
      data: {
        pointsRedeemed: points,
        cashValue,
        rewardType
      }
    });
  } catch (error) {
    console.error('Redeem points error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to redeem points' 
    });
  }
});

// @route   GET /api/rewards/leaderboard
// @desc    Get rewards leaderboard
// @access  Public
router.get('/leaderboard', async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const leaderboard = await prisma.reward.findMany({
      take: parseInt(limit),
      orderBy: { lifetimePoints: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
            city: true,
            state: true
          }
        }
      }
    });

    res.json({
      success: true,
      data: leaderboard.map((entry, index) => ({
        rank: index + 1,
        userId: entry.user.id,
        name: entry.user.name,
        avatar: entry.user.avatar,
        location: entry.user.city && entry.user.state 
          ? `${entry.user.city}, ${entry.user.state}` 
          : null,
        lifetimePoints: entry.lifetimePoints,
        level: entry.level
      }))
    });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get leaderboard' 
    });
  }
});

// @route   GET /api/rewards/levels
// @desc    Get reward level info
// @access  Public
router.get('/levels', (req, res) => {
  res.json({
    success: true,
    data: Object.entries(REWARD_LEVELS).map(([level, config]) => ({
      level,
      minPoints: config.min,
      maxPoints: config.max === Infinity ? null : config.max,
      multiplier: config.multiplier,
      benefits: getBenefits(level)
    }))
  });
});

// Helper to get level benefits
function getBenefits(level) {
  const benefits = {
    Bronze: ['Basic rewards', 'Standard pickup scheduling'],
    Silver: ['25% bonus points', 'Priority pickup scheduling', 'Monthly bonus rewards'],
    Gold: ['50% bonus points', 'Same-day pickup', 'Exclusive partner offers'],
    Platinum: ['100% bonus points', 'VIP support', 'Early access to new features', 'Partner discounts'],
    Diamond: ['150% bonus points', 'Dedicated account manager', 'Custom pickup schedules', 'Maximum partner discounts']
  };
  return benefits[level] || [];
}

module.exports = router;
