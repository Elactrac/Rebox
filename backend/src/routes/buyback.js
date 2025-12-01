const express = require('express');
const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// @route   POST /api/buyback/offers
// @desc    Create a buyback offer (Business only)
// @access  Private (Business)
router.post('/offers', authenticate, authorize('BUSINESS', 'ADMIN'), [
  body('packageId').notEmpty().withMessage('Package ID required'),
  body('offeredPrice').isFloat({ min: 0.01 }).withMessage('Valid price required'),
  body('expiresAt').optional().isISO8601().withMessage('Valid expiry date required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const { packageId, offeredPrice, expiresAt } = req.body;

    // Verify package exists and is available
    const package_ = await prisma.package.findUnique({
      where: { id: packageId },
      include: { user: { select: { id: true, name: true } } }
    });

    if (!package_) {
      return res.status(404).json({ 
        success: false, 
        message: 'Package not found' 
      });
    }

    if (!['LISTED', 'SCHEDULED'].includes(package_.status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Package is not available for buyback' 
      });
    }

    // Check for existing offer from same brand
    const existingOffer = await prisma.buybackOffer.findFirst({
      where: {
        brandId: req.user.id,
        packageId,
        status: 'PENDING'
      }
    });

    if (existingOffer) {
      return res.status(400).json({ 
        success: false, 
        message: 'You already have a pending offer for this package' 
      });
    }

    const offer = await prisma.$transaction(async (tx) => {
      const newOffer = await tx.buybackOffer.create({
        data: {
          brandId: req.user.id,
          packageId,
          offeredPrice,
          expiresAt: expiresAt ? new Date(expiresAt) : null
        },
        include: {
          brand: { select: { id: true, name: true, companyName: true } },
          package: true
        }
      });

      // Notify package owner
      await tx.notification.create({
        data: {
          userId: package_.userId,
          title: 'New Buyback Offer',
          message: `You received a $${offeredPrice.toFixed(2)} offer for your ${package_.type.toLowerCase()}`,
          type: 'OFFER',
          data: { offerId: newOffer.id, packageId }
        }
      });

      return newOffer;
    });

    res.status(201).json({
      success: true,
      message: 'Offer created',
      data: offer
    });
  } catch (error) {
    console.error('Create offer error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create offer' 
    });
  }
});

// @route   GET /api/buyback/offers
// @desc    Get buyback offers
// @access  Private
router.get('/offers', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 20, status, type } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    let where = {};

    // Different views based on role
    if (req.user.role === 'BUSINESS') {
      // Brands see their own offers
      where.brandId = req.user.id;
    } else {
      // Users see offers on their packages
      where.package = { userId: req.user.id };
    }

    if (status) where.status = status;

    const [offers, total] = await Promise.all([
      prisma.buybackOffer.findMany({
        where,
        skip,
        take: parseInt(limit),
        include: {
          brand: { select: { id: true, name: true, companyName: true } },
          package: {
            include: {
              user: { select: { id: true, name: true } }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.buybackOffer.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        offers,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get offers error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get offers' 
    });
  }
});

// @route   PUT /api/buyback/offers/:id/accept
// @desc    Accept a buyback offer
// @access  Private (Package owner)
router.put('/offers/:id/accept', authenticate, async (req, res) => {
  try {
    const offer = await prisma.buybackOffer.findUnique({
      where: { id: req.params.id },
      include: {
        package: true,
        brand: { select: { id: true, name: true, companyName: true } }
      }
    });

    if (!offer) {
      return res.status(404).json({ 
        success: false, 
        message: 'Offer not found' 
      });
    }

    if (offer.package.userId !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized' 
      });
    }

    if (offer.status !== 'PENDING') {
      return res.status(400).json({ 
        success: false, 
        message: 'Offer is no longer available' 
      });
    }

    if (offer.expiresAt && new Date(offer.expiresAt) < new Date()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Offer has expired' 
      });
    }

    await prisma.$transaction(async (tx) => {
      // Accept this offer
      await tx.buybackOffer.update({
        where: { id: req.params.id },
        data: {
          status: 'ACCEPTED',
          acceptedById: req.user.id
        }
      });

      // Reject other pending offers for same package
      await tx.buybackOffer.updateMany({
        where: {
          packageId: offer.packageId,
          id: { not: req.params.id },
          status: 'PENDING'
        },
        data: { status: 'REJECTED' }
      });

      // Create transaction for buyback
      await tx.transaction.create({
        data: {
          userId: req.user.id,
          type: 'BRAND_BUYBACK',
          points: Math.floor(offer.offeredPrice * 10), // Bonus points
          amount: offer.offeredPrice,
          description: `Buyback from ${offer.brand.companyName || offer.brand.name}`
        }
      });

      // Notify brand
      await tx.notification.create({
        data: {
          userId: offer.brandId,
          title: 'Offer Accepted',
          message: `Your buyback offer of $${offer.offeredPrice.toFixed(2)} was accepted`,
          type: 'OFFER',
          data: { offerId: offer.id }
        }
      });
    });

    res.json({
      success: true,
      message: 'Offer accepted'
    });
  } catch (error) {
    console.error('Accept offer error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to accept offer' 
    });
  }
});

// @route   PUT /api/buyback/offers/:id/reject
// @desc    Reject a buyback offer
// @access  Private (Package owner)
router.put('/offers/:id/reject', authenticate, async (req, res) => {
  try {
    const offer = await prisma.buybackOffer.findUnique({
      where: { id: req.params.id },
      include: { package: true }
    });

    if (!offer) {
      return res.status(404).json({ 
        success: false, 
        message: 'Offer not found' 
      });
    }

    if (offer.package.userId !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized' 
      });
    }

    await prisma.buybackOffer.update({
      where: { id: req.params.id },
      data: { status: 'REJECTED' }
    });

    res.json({
      success: true,
      message: 'Offer rejected'
    });
  } catch (error) {
    console.error('Reject offer error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to reject offer' 
    });
  }
});

// @route   DELETE /api/buyback/offers/:id
// @desc    Cancel/delete a buyback offer
// @access  Private (Brand owner)
router.delete('/offers/:id', authenticate, async (req, res) => {
  try {
    const offer = await prisma.buybackOffer.findUnique({
      where: { id: req.params.id }
    });

    if (!offer) {
      return res.status(404).json({ 
        success: false, 
        message: 'Offer not found' 
      });
    }

    if (offer.brandId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized' 
      });
    }

    if (offer.status !== 'PENDING') {
      return res.status(400).json({ 
        success: false, 
        message: 'Can only cancel pending offers' 
      });
    }

    await prisma.buybackOffer.delete({
      where: { id: req.params.id }
    });

    res.json({
      success: true,
      message: 'Offer cancelled'
    });
  } catch (error) {
    console.error('Cancel offer error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to cancel offer' 
    });
  }
});

// @route   GET /api/buyback/marketplace
// @desc    Browse available packages for buyback (Businesses)
// @access  Private (Business)
router.get('/marketplace', authenticate, authorize('BUSINESS', 'ADMIN'), async (req, res) => {
  try {
    const { page = 1, limit = 20, type, condition, brand } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = { status: 'LISTED' };
    if (type) where.type = type;
    if (condition) where.condition = condition;
    if (brand) where.brand = { contains: brand, mode: 'insensitive' };

    const [packages, total] = await Promise.all([
      prisma.package.findMany({
        where,
        skip,
        take: parseInt(limit),
        include: {
          user: {
            select: { city: true, state: true }
          },
          _count: {
            select: { buybackOffers: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.package.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        packages,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get marketplace error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get marketplace' 
    });
  }
});

module.exports = router;
