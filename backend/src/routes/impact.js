const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate, authorize } = require('../middleware/auth');
const cache = require('../services/cache');
const { publicCache, userCache } = require('../middleware/cache');

const router = express.Router();
const prisma = new PrismaClient();

// @route   GET /api/impact
// @desc    Get user's environmental impact
// @access  Private
router.get('/', authenticate, async (req, res) => {
  try {
    let impact = await prisma.impactStats.findUnique({
      where: { userId: req.user.id }
    });

    if (!impact) {
      impact = await prisma.impactStats.create({
        data: {
          userId: req.user.id,
          totalPackages: 0,
          totalWeight: 0,
          co2Saved: 0,
          waterSaved: 0,
          treesEquivalent: 0,
          landfillDiverted: 0
        }
      });
    }

    // Calculate additional metrics
    const additionalMetrics = {
      // Average car drives equivalent (1 mile = ~0.4kg CO2)
      carMilesEquivalent: Math.round(impact.co2Saved / 0.4),
      // Plastic bottles equivalent (1 bottle = ~0.08kg CO2)
      plasticBottlesEquivalent: Math.round(impact.co2Saved / 0.08),
      // Showers equivalent (1 shower = ~65 liters)
      showersEquivalent: Math.round(impact.waterSaved / 65),
      // Energy saved (kWh, rough estimate)
      energySaved: Math.round(impact.co2Saved * 2.3)
    };

    res.json({
      success: true,
      data: {
        ...impact,
        ...additionalMetrics
      }
    });
  } catch (error) {
    console.error('Get impact error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get impact stats' 
    });
  }
});

// @route   GET /api/impact/history
// @desc    Get impact history over time
// @access  Private
router.get('/history', authenticate, async (req, res) => {
  try {
    const { period = 'month' } = req.query;

    // Get completed pickups with timestamps
    const pickups = await prisma.pickup.findMany({
      where: {
        userId: req.user.id,
        status: 'COMPLETED'
      },
      select: {
        completedAt: true,
        totalItems: true,
        totalWeight: true,
        items: {
          include: {
            package: {
              select: { co2Saved: true, waterSaved: true }
            }
          }
        }
      },
      orderBy: { completedAt: 'asc' }
    });

    // Aggregate by period
    const history = {};
    pickups.forEach(pickup => {
      if (!pickup.completedAt) return;
      
      let key;
      const date = new Date(pickup.completedAt);
      
      if (period === 'day') {
        key = date.toISOString().split('T')[0];
      } else if (period === 'week') {
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toISOString().split('T')[0];
      } else { // month
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      }

      if (!history[key]) {
        history[key] = {
          period: key,
          packages: 0,
          weight: 0,
          co2Saved: 0,
          waterSaved: 0
        };
      }

      history[key].packages += pickup.totalItems;
      history[key].weight += pickup.totalWeight || 0;
      pickup.items.forEach(item => {
        history[key].co2Saved += item.package.co2Saved || 0;
        history[key].waterSaved += item.package.waterSaved || 0;
      });
    });

    res.json({
      success: true,
      data: Object.values(history)
    });
  } catch (error) {
    console.error('Get impact history error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get impact history' 
    });
  }
});

// @route   GET /api/impact/global
// @desc    Get global/platform-wide impact stats
// @access  Public
router.get('/global', publicCache(cache.TTL_CONFIG.medium), async (req, res) => {
  try {
    const stats = await prisma.impactStats.aggregate({
      _sum: {
        totalPackages: true,
        totalWeight: true,
        co2Saved: true,
        waterSaved: true,
        treesEquivalent: true,
        landfillDiverted: true
      },
      _count: { id: true }
    });

    const userCount = await prisma.user.count();
    const pickupCount = await prisma.pickup.count({
      where: { status: 'COMPLETED' }
    });

    res.json({
      success: true,
      data: {
        totalUsers: userCount,
        totalPickups: pickupCount,
        totalPackages: stats._sum.totalPackages || 0,
        totalWeight: stats._sum.totalWeight || 0,
        co2Saved: stats._sum.co2Saved || 0,
        waterSaved: stats._sum.waterSaved || 0,
        treesEquivalent: stats._sum.treesEquivalent || 0,
        landfillDiverted: stats._sum.landfillDiverted || 0
      }
    });
  } catch (error) {
    console.error('Get global impact error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get global impact' 
    });
  }
});

// @route   GET /api/impact/reports
// @desc    Get sustainability reports (for businesses)
// @access  Private (Business/Admin)
router.get('/reports', authenticate, authorize('BUSINESS', 'ADMIN'), async (req, res) => {
  try {
    const reports = await prisma.sustainabilityReport.findMany({
      orderBy: { period: 'desc' },
      take: 12
    });

    res.json({
      success: true,
      data: reports
    });
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get reports' 
    });
  }
});

// @route   POST /api/impact/reports/generate
// @desc    Generate sustainability report (Admin only)
// @access  Private (Admin)
router.post('/reports/generate', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const { period } = req.body; // e.g., "2024-Q1"

    // Check if report already exists
    const existing = await prisma.sustainabilityReport.findUnique({
      where: { period }
    });

    if (existing) {
      return res.status(400).json({ 
        success: false, 
        message: 'Report for this period already exists' 
      });
    }

    // Aggregate data
    const [userCount, packageCount, pickupCount, impactTotals] = await Promise.all([
      prisma.user.count(),
      prisma.package.count(),
      prisma.pickup.count({ where: { status: 'COMPLETED' } }),
      prisma.impactStats.aggregate({
        _sum: {
          co2Saved: true,
          waterSaved: true,
          landfillDiverted: true
        }
      })
    ]);

    // Top recyclers
    const topRecyclers = await prisma.user.findMany({
      where: { role: 'RECYCLER' },
      select: {
        id: true,
        name: true,
        companyName: true,
        _count: { select: { pickupsAsRecycler: true } }
      },
      orderBy: {
        pickupsAsRecycler: { _count: 'desc' }
      },
      take: 10
    });

    const report = await prisma.sustainabilityReport.create({
      data: {
        period,
        totalUsers: userCount,
        totalPackages: packageCount,
        totalPickups: pickupCount,
        totalCO2Saved: impactTotals._sum.co2Saved || 0,
        totalWaterSaved: impactTotals._sum.waterSaved || 0,
        totalLandfillDiverted: impactTotals._sum.landfillDiverted || 0,
        topRecyclers: topRecyclers
      }
    });

    res.status(201).json({
      success: true,
      message: 'Report generated',
      data: report
    });
  } catch (error) {
    console.error('Generate report error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to generate report' 
    });
  }
});

// @route   GET /api/impact/certificate
// @desc    Get impact certificate data for user
// @access  Private
router.get('/certificate', authenticate, async (req, res) => {
  try {
    const [user, impact, pickupCount] = await Promise.all([
      prisma.user.findUnique({
        where: { id: req.user.id },
        select: { name: true, createdAt: true }
      }),
      prisma.impactStats.findUnique({
        where: { userId: req.user.id }
      }),
      prisma.pickup.count({
        where: { userId: req.user.id, status: 'COMPLETED' }
      })
    ]);

    if (!impact || impact.totalPackages === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'No impact data available yet' 
      });
    }

    res.json({
      success: true,
      data: {
        userName: user.name,
        memberSince: user.createdAt,
        totalPickups: pickupCount,
        totalPackages: impact.totalPackages,
        co2Saved: impact.co2Saved,
        waterSaved: impact.waterSaved,
        treesEquivalent: impact.treesEquivalent,
        landfillDiverted: impact.landfillDiverted,
        certificateId: `RB-CERT-${req.user.id.slice(-8).toUpperCase()}`,
        generatedAt: new Date()
      }
    });
  } catch (error) {
    console.error('Get certificate error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get certificate' 
    });
  }
});

module.exports = router;
