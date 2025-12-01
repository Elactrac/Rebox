const express = require('express');
const QRCode = require('qrcode');
const { PrismaClient } = require('@prisma/client');
const { authenticate, optionalAuth } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// @route   GET /api/qr/pickup/:trackingCode
// @desc    Generate QR code for pickup tracking
// @access  Public
router.get('/pickup/:trackingCode', async (req, res) => {
  try {
    const { trackingCode } = req.params;
    const { format = 'png', size = 200 } = req.query;

    // Verify pickup exists
    const pickup = await prisma.pickup.findUnique({
      where: { trackingCode },
      select: { id: true, trackingCode: true }
    });

    if (!pickup) {
      return res.status(404).json({
        success: false,
        message: 'Pickup not found'
      });
    }

    // Generate tracking URL
    const trackingUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/track/${trackingCode}`;

    // Generate QR code based on format
    if (format === 'svg') {
      const svg = await QRCode.toString(trackingUrl, {
        type: 'svg',
        width: parseInt(size),
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      res.type('image/svg+xml').send(svg);
    } else if (format === 'dataurl') {
      const dataUrl = await QRCode.toDataURL(trackingUrl, {
        width: parseInt(size),
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      res.json({
        success: true,
        data: {
          trackingCode,
          trackingUrl,
          qrCode: dataUrl
        }
      });
    } else {
      // Default PNG
      res.type('image/png');
      const buffer = await QRCode.toBuffer(trackingUrl, {
        width: parseInt(size),
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      res.send(buffer);
    }
  } catch (error) {
    console.error('QR generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate QR code'
    });
  }
});

// @route   GET /api/qr/package/:id
// @desc    Generate QR code for package
// @access  Private
router.get('/package/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { format = 'dataurl', size = 200 } = req.query;

    const package_ = await prisma.package.findUnique({
      where: { id },
      select: {
        id: true,
        userId: true,
        type: true,
        status: true
      }
    });

    if (!package_) {
      return res.status(404).json({
        success: false,
        message: 'Package not found'
      });
    }

    // Only owner can generate QR for their package
    if (package_.userId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    const packageUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/packages/${id}`;

    if (format === 'svg') {
      const svg = await QRCode.toString(packageUrl, {
        type: 'svg',
        width: parseInt(size),
        margin: 2
      });
      res.type('image/svg+xml').send(svg);
    } else if (format === 'png') {
      res.type('image/png');
      const buffer = await QRCode.toBuffer(packageUrl, {
        width: parseInt(size),
        margin: 2
      });
      res.send(buffer);
    } else {
      const dataUrl = await QRCode.toDataURL(packageUrl, {
        width: parseInt(size),
        margin: 2
      });
      res.json({
        success: true,
        data: {
          packageId: id,
          packageUrl,
          qrCode: dataUrl
        }
      });
    }
  } catch (error) {
    console.error('Package QR generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate QR code'
    });
  }
});

// @route   POST /api/qr/batch
// @desc    Generate multiple QR codes for pickups
// @access  Private (Recycler/Admin)
router.post('/batch', authenticate, async (req, res) => {
  try {
    const { trackingCodes } = req.body;

    if (!trackingCodes || !Array.isArray(trackingCodes) || trackingCodes.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'trackingCodes array is required'
      });
    }

    if (trackingCodes.length > 50) {
      return res.status(400).json({
        success: false,
        message: 'Maximum 50 QR codes per batch'
      });
    }

    const results = await Promise.all(
      trackingCodes.map(async (trackingCode) => {
        try {
          const pickup = await prisma.pickup.findUnique({
            where: { trackingCode },
            select: { id: true, trackingCode: true, status: true }
          });

          if (!pickup) {
            return { trackingCode, error: 'Not found' };
          }

          const trackingUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/track/${trackingCode}`;
          const qrCode = await QRCode.toDataURL(trackingUrl, {
            width: 200,
            margin: 2
          });

          return {
            trackingCode,
            trackingUrl,
            status: pickup.status,
            qrCode
          };
        } catch (err) {
          return { trackingCode, error: err.message };
        }
      })
    );

    res.json({
      success: true,
      data: {
        generated: results.filter(r => r.qrCode).length,
        failed: results.filter(r => r.error).length,
        results
      }
    });
  } catch (error) {
    console.error('Batch QR generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate QR codes'
    });
  }
});

// @route   GET /api/qr/label/:trackingCode
// @desc    Generate printable shipping label with QR code
// @access  Private
router.get('/label/:trackingCode', authenticate, async (req, res) => {
  try {
    const { trackingCode } = req.params;

    const pickup = await prisma.pickup.findUnique({
      where: { trackingCode },
      include: {
        user: {
          select: { name: true, phone: true }
        }
      }
    });

    if (!pickup) {
      return res.status(404).json({
        success: false,
        message: 'Pickup not found'
      });
    }

    // Check authorization
    if (pickup.userId !== req.user.id && 
        pickup.recyclerId !== req.user.id && 
        req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    const trackingUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/track/${trackingCode}`;
    const qrCode = await QRCode.toDataURL(trackingUrl, {
      width: 150,
      margin: 1
    });

    // Return label data
    res.json({
      success: true,
      data: {
        label: {
          trackingCode: pickup.trackingCode,
          qrCode,
          pickupDate: pickup.scheduledDate,
          timeSlot: pickup.scheduledSlot,
          address: {
            full: `${pickup.address}, ${pickup.city}, ${pickup.state} ${pickup.zipCode}`,
            street: pickup.address,
            city: pickup.city,
            state: pickup.state,
            zipCode: pickup.zipCode
          },
          contact: {
            name: pickup.user.name,
            phone: pickup.user.phone
          },
          items: pickup.totalItems,
          weight: pickup.totalWeight,
          instructions: pickup.instructions
        }
      }
    });
  } catch (error) {
    console.error('Label generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate label'
    });
  }
});

module.exports = router;
