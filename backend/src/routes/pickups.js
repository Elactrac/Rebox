const express = require('express');
const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const { authenticate, authorize } = require('../middleware/auth');
const { sendToUser, sendPickupUpdate, NotificationTypes } = require('../services/socket');
const { sendEmail } = require('../services/email');
const crypto = require('crypto');

const router = express.Router();
const prisma = new PrismaClient();

// Generate tracking code
const generateTrackingCode = () => {
  return 'RB' + crypto.randomBytes(4).toString('hex').toUpperCase();
};

// Calculate reward points
const calculateRewardPoints = (items, totalValue) => {
  // Base: 10 points per dollar value + 5 points per item
  const basePoints = Math.floor(totalValue * 10);
  const itemBonus = items.length * 5;
  return basePoints + itemBonus;
};

// @route   POST /api/pickups
// @desc    Schedule a new pickup
// @access  Private
router.post('/', authenticate, [
  body('packageIds').isArray({ min: 1 }).withMessage('At least one package required'),
  body('scheduledDate').isISO8601().withMessage('Valid date required'),
  body('scheduledSlot').notEmpty().withMessage('Time slot required'),
  body('address').notEmpty().withMessage('Address required'),
  body('city').notEmpty().withMessage('City required'),
  body('state').notEmpty().withMessage('State required'),
  body('zipCode').notEmpty().withMessage('Zip code required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const { 
      packageIds, 
      scheduledDate, 
      scheduledSlot, 
      address, 
      city, 
      state, 
      zipCode,
      instructions,
      latitude,
      longitude
    } = req.body;

    // Verify packages belong to user and are available
    const packages = await prisma.package.findMany({
      where: {
        id: { in: packageIds },
        userId: req.user.id,
        status: 'LISTED'
      }
    });

    if (packages.length !== packageIds.length) {
      return res.status(400).json({ 
        success: false, 
        message: 'Some packages are unavailable or do not belong to you' 
      });
    }

    // Calculate totals
    const totalItems = packages.reduce((sum, p) => sum + p.quantity, 0);
    const totalWeight = packages.reduce((sum, p) => sum + (p.weight || 0), 0);
    const totalValue = packages.reduce((sum, p) => sum + p.estimatedValue, 0);
    const rewardPoints = calculateRewardPoints(packages, totalValue);

    // Create pickup with items
    const pickup = await prisma.$transaction(async (tx) => {
      // Create the pickup
      const newPickup = await tx.pickup.create({
        data: {
          userId: req.user.id,
          scheduledDate: new Date(scheduledDate),
          scheduledSlot,
          address,
          city,
          state,
          zipCode,
          instructions,
          latitude,
          longitude,
          totalItems,
          totalWeight,
          totalValue,
          rewardPoints,
          trackingCode: generateTrackingCode(),
          items: {
            create: packages.map(p => ({
              packageId: p.id,
              quantity: p.quantity
            }))
          }
        },
        include: {
          items: {
            include: { package: true }
          }
        }
      });

      // Update package statuses
      await tx.package.updateMany({
        where: { id: { in: packageIds } },
        data: { status: 'SCHEDULED' }
      });

      // Create notification
      await tx.notification.create({
        data: {
          userId: req.user.id,
          title: 'Pickup Scheduled',
          message: `Your pickup has been scheduled for ${new Date(scheduledDate).toLocaleDateString()}`,
          type: 'PICKUP',
          data: { pickupId: newPickup.id }
        }
      });

      return newPickup;
    });

    // Send real-time notification to user
    sendToUser(req.user.id, NotificationTypes.PICKUP_SCHEDULED, {
      pickupId: pickup.id,
      trackingCode: pickup.trackingCode,
      scheduledDate: pickup.scheduledDate,
      scheduledSlot: pickup.scheduledSlot,
      message: 'Your pickup has been scheduled!'
    });

    // Get user details for emails
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { name: true, email: true }
    });

    // Send confirmation email to user
    if (user.email) {
      sendEmail(user.email, 'pickupConfirmation', [user.name, pickup]).catch(err => 
        console.error('Failed to send user confirmation email:', err)
      );
    }

    // Get all active recyclers in the area and notify them
    const recyclers = await prisma.user.findMany({
      where: {
        role: 'RECYCLER',
        isVerified: true
      },
      select: { id: true, name: true, email: true }
    });

    // Send email to all recyclers about new pickup
    recyclers.forEach(recycler => {
      if (recycler.email) {
        sendEmail(recycler.email, 'newPickupAlert', [recycler.name, pickup, user]).catch(err =>
          console.error(`Failed to send pickup alert to recycler ${recycler.email}:`, err)
        );
      }
    });

    res.status(201).json({
      success: true,
      message: 'Pickup scheduled successfully',
      data: pickup
    });
  } catch (error) {
    console.error('Create pickup error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to schedule pickup' 
    });
  }
});

// @route   GET /api/pickups
// @desc    Get user's pickups
// @access  Private
router.get('/', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    
    // Different queries based on role
    if (req.user.role === 'RECYCLER') {
      where.OR = [
        { recyclerId: req.user.id },
        { recyclerId: null, status: 'PENDING' }
      ];
    } else if (req.user.role !== 'ADMIN') {
      where.userId = req.user.id;
    }

    if (status) where.status = status;

    const [pickups, total] = await Promise.all([
      prisma.pickup.findMany({
        where,
        skip,
        take: parseInt(limit),
        include: {
          user: {
            select: { id: true, name: true, phone: true }
          },
          recycler: {
            select: { id: true, name: true, companyName: true, phone: true }
          },
          items: {
            include: {
              package: true
            }
          }
        },
        orderBy: { scheduledDate: 'desc' }
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
    console.error('Get pickups error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get pickups' 
    });
  }
});

// @route   GET /api/pickups/:id
// @desc    Get pickup by ID
// @access  Private
router.get('/:id', authenticate, async (req, res) => {
  try {
    const pickup = await prisma.pickup.findUnique({
      where: { id: req.params.id },
      include: {
        user: {
          select: { id: true, name: true, phone: true, email: true }
        },
        recycler: {
          select: { id: true, name: true, companyName: true, phone: true }
        },
        items: {
          include: {
            package: true
          }
        },
        transaction: true
      }
    });

    if (!pickup) {
      return res.status(404).json({ 
        success: false, 
        message: 'Pickup not found' 
      });
    }

    // Check authorization
    const isOwner = pickup.userId === req.user.id;
    const isRecycler = pickup.recyclerId === req.user.id;
    const isAdmin = req.user.role === 'ADMIN';

    if (!isOwner && !isRecycler && !isAdmin) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to view this pickup' 
      });
    }

    res.json({
      success: true,
      data: pickup
    });
  } catch (error) {
    console.error('Get pickup error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get pickup' 
    });
  }
});

// @route   GET /api/pickups/track/:trackingCode
// @desc    Track pickup by tracking code
// @access  Public
router.get('/track/:trackingCode', async (req, res) => {
  try {
    const pickup = await prisma.pickup.findUnique({
      where: { trackingCode: req.params.trackingCode },
      select: {
        id: true,
        status: true,
        scheduledDate: true,
        scheduledSlot: true,
        actualPickupTime: true,
        totalItems: true,
        trackingCode: true,
        createdAt: true,
        completedAt: true
      }
    });

    if (!pickup) {
      return res.status(404).json({ 
        success: false, 
        message: 'Pickup not found' 
      });
    }

    res.json({
      success: true,
      data: pickup
    });
  } catch (error) {
    console.error('Track pickup error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to track pickup' 
    });
  }
});

// @route   PUT /api/pickups/:id/accept
// @desc    Recycler accepts a pickup
// @access  Private (Recycler)
router.put('/:id/accept', authenticate, authorize('RECYCLER', 'ADMIN'), async (req, res) => {
  try {
    const pickup = await prisma.pickup.findUnique({
      where: { id: req.params.id }
    });

    if (!pickup) {
      return res.status(404).json({ 
        success: false, 
        message: 'Pickup not found' 
      });
    }

    if (pickup.status !== 'PENDING') {
      return res.status(400).json({ 
        success: false, 
        message: 'Pickup is not available for acceptance' 
      });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const updatedPickup = await tx.pickup.update({
        where: { id: req.params.id },
        data: {
          recyclerId: req.user.id,
          status: 'CONFIRMED'
        }
      });

      // Notify user
      await tx.notification.create({
        data: {
          userId: pickup.userId,
          title: 'Pickup Confirmed',
          message: 'A recycler has accepted your pickup request',
          type: 'PICKUP',
          data: { pickupId: pickup.id }
        }
      });

      return updatedPickup;
    });

    // Send real-time notification to user
    sendToUser(pickup.userId, NotificationTypes.PICKUP_CONFIRMED, {
      pickupId: pickup.id,
      message: 'A recycler has accepted your pickup request!'
    });

    // Notify pickup room
    sendPickupUpdate(pickup.id, 'pickup:status_changed', {
      status: 'CONFIRMED',
      recyclerId: req.user.id
    });

    res.json({
      success: true,
      message: 'Pickup accepted',
      data: updated
    });
  } catch (error) {
    console.error('Accept pickup error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to accept pickup' 
    });
  }
});

// @route   PUT /api/pickups/:id/status
// @desc    Update pickup status
// @access  Private (Recycler/Admin)
router.put('/:id/status', authenticate, authorize('RECYCLER', 'ADMIN'), [
  body('status').isIn(['IN_TRANSIT', 'COMPLETED', 'CANCELLED']).withMessage('Invalid status')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const { status } = req.body;
    const pickup = await prisma.pickup.findUnique({
      where: { id: req.params.id },
      include: { items: { include: { package: true } } }
    });

    if (!pickup) {
      return res.status(404).json({ 
        success: false, 
        message: 'Pickup not found' 
      });
    }

    // Verify recycler owns this pickup
    if (req.user.role === 'RECYCLER' && pickup.recyclerId !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized' 
      });
    }

    const updateData = { status };
    
    if (status === 'COMPLETED') {
      updateData.completedAt = new Date();
      updateData.actualPickupTime = new Date();
    }

    const updated = await prisma.$transaction(async (tx) => {
      const updatedPickup = await tx.pickup.update({
        where: { id: req.params.id },
        data: updateData
      });

      if (status === 'COMPLETED') {
        // Update package statuses
        const packageIds = pickup.items.map(i => i.packageId);
        await tx.package.updateMany({
          where: { id: { in: packageIds } },
          data: { status: 'PICKED_UP' }
        });

        // Award points
        await tx.reward.update({
          where: { userId: pickup.userId },
          data: {
            totalPoints: { increment: pickup.rewardPoints },
            availablePoints: { increment: pickup.rewardPoints },
            lifetimePoints: { increment: pickup.rewardPoints }
          }
        });

        // Create transaction record
        await tx.transaction.create({
          data: {
            userId: pickup.userId,
            pickupId: pickup.id,
            type: 'PICKUP_REWARD',
            points: pickup.rewardPoints,
            amount: pickup.totalValue,
            description: `Reward for pickup ${pickup.trackingCode}`
          }
        });

        // Update impact stats
        const totalCO2 = pickup.items.reduce((sum, i) => sum + (i.package.co2Saved || 0), 0);
        const totalWater = pickup.items.reduce((sum, i) => sum + (i.package.waterSaved || 0), 0);

        await tx.impactStats.update({
          where: { userId: pickup.userId },
          data: {
            totalPackages: { increment: pickup.totalItems },
            totalWeight: { increment: pickup.totalWeight || 0 },
            co2Saved: { increment: totalCO2 },
            waterSaved: { increment: totalWater },
            landfillDiverted: { increment: pickup.totalWeight || 0 },
            treesEquivalent: { increment: totalCO2 / 20 } // ~20kg CO2 per tree per year
          }
        });

        // Notify user
        await tx.notification.create({
          data: {
            userId: pickup.userId,
            title: 'Pickup Completed!',
            message: `You earned ${pickup.rewardPoints} points! Thank you for recycling.`,
            type: 'REWARD',
            data: { pickupId: pickup.id, points: pickup.rewardPoints }
          }
        });
      }

      return updatedPickup;
    });

    // Send real-time notifications
    if (status === 'COMPLETED') {
      sendToUser(pickup.userId, NotificationTypes.PICKUP_COMPLETED, {
        pickupId: pickup.id,
        points: pickup.rewardPoints,
        message: `Pickup completed! You earned ${pickup.rewardPoints} points!`
      });

      sendToUser(pickup.userId, NotificationTypes.REWARD_EARNED, {
        points: pickup.rewardPoints,
        source: 'pickup'
      });
    } else if (status === 'IN_TRANSIT') {
      sendToUser(pickup.userId, NotificationTypes.PICKUP_IN_TRANSIT, {
        pickupId: pickup.id,
        message: 'Your pickup is on the way!'
      });
    }

    // Notify pickup room
    sendPickupUpdate(pickup.id, 'pickup:status_changed', {
      status,
      timestamp: new Date()
    });

    res.json({
      success: true,
      message: `Pickup status updated to ${status}`,
      data: updated
    });
  } catch (error) {
    console.error('Update pickup status error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update pickup status' 
    });
  }
});

// @route   PUT /api/pickups/:id/cancel
// @desc    Cancel a pickup
// @access  Private (Owner)
router.put('/:id/cancel', authenticate, async (req, res) => {
  try {
    const pickup = await prisma.pickup.findUnique({
      where: { id: req.params.id },
      include: { items: true }
    });

    if (!pickup) {
      return res.status(404).json({ 
        success: false, 
        message: 'Pickup not found' 
      });
    }

    if (pickup.userId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized' 
      });
    }

    if (['COMPLETED', 'CANCELLED'].includes(pickup.status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot cancel this pickup' 
      });
    }

    await prisma.$transaction(async (tx) => {
      await tx.pickup.update({
        where: { id: req.params.id },
        data: { status: 'CANCELLED' }
      });

      // Reset package statuses
      const packageIds = pickup.items.map(i => i.packageId);
      await tx.package.updateMany({
        where: { id: { in: packageIds } },
        data: { status: 'LISTED' }
      });
    });

    res.json({
      success: true,
      message: 'Pickup cancelled'
    });
  } catch (error) {
    console.error('Cancel pickup error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to cancel pickup' 
    });
  }
});

// @route   GET /api/pickups/available-slots
// @desc    Get available pickup slots
// @access  Public
router.get('/slots/available', async (req, res) => {
  try {
    const { date } = req.query;
    
    // Available time slots
    const slots = [
      '9AM-12PM',
      '12PM-3PM',
      '3PM-6PM'
    ];

    // In production, check for slot availability based on recycler capacity
    // For now, return all slots as available
    res.json({
      success: true,
      data: {
        date: date || new Date().toISOString().split('T')[0],
        slots: slots.map(slot => ({ slot, available: true }))
      }
    });
  } catch (error) {
    console.error('Get slots error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get slots' 
    });
  }
});

module.exports = router;
