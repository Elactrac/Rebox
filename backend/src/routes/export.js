/**
 * Export Routes for ReBox
 * Generates CSV and PDF reports for packages, pickups, and impact data
 */

const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth');
const { heavyOperationLimiter } = require('../middleware/rateLimiter');

const router = express.Router();
const prisma = new PrismaClient();

// Helper to convert data to CSV
const toCSV = (data, columns) => {
  if (!data || data.length === 0) {
    return columns.map(c => c.header).join(',') + '\n';
  }

  const header = columns.map(c => `"${c.header}"`).join(',');
  const rows = data.map(row => 
    columns.map(c => {
      let value = c.accessor(row);
      if (value === null || value === undefined) value = '';
      if (typeof value === 'string') {
        value = value.replace(/"/g, '""'); // Escape quotes
        return `"${value}"`;
      }
      return value;
    }).join(',')
  );

  return header + '\n' + rows.join('\n');
};

// Helper to format date
const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toISOString().split('T')[0];
};

// @route   GET /api/export/packages/csv
// @desc    Export user's packages as CSV
// @access  Private
router.get('/packages/csv', authenticate, heavyOperationLimiter, async (req, res) => {
  try {
    const { status, type, from, to } = req.query;

    const where = { userId: req.user.id };
    if (status) where.status = status;
    if (type) where.type = type;
    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = new Date(from);
      if (to) where.createdAt.lte = new Date(to);
    }

    const packages = await prisma.package.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    const columns = [
      { header: 'ID', accessor: (row) => row.id },
      { header: 'Type', accessor: (row) => row.type },
      { header: 'Condition', accessor: (row) => row.condition },
      { header: 'Status', accessor: (row) => row.status },
      { header: 'Brand', accessor: (row) => row.brand },
      { header: 'Description', accessor: (row) => row.description },
      { header: 'Quantity', accessor: (row) => row.quantity },
      { header: 'Weight (kg)', accessor: (row) => row.weight },
      { header: 'Estimated Value ($)', accessor: (row) => row.estimatedValue?.toFixed(2) },
      { header: 'CO2 Saved (kg)', accessor: (row) => row.co2Saved?.toFixed(2) },
      { header: 'Water Saved (L)', accessor: (row) => row.waterSaved?.toFixed(2) },
      { header: 'Created At', accessor: (row) => formatDate(row.createdAt) },
    ];

    const csv = toCSV(packages, columns);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="rebox-packages-${formatDate(new Date())}.csv"`);
    res.send(csv);
  } catch (error) {
    console.error('Export packages error:', error);
    res.status(500).json({ success: false, message: 'Failed to export packages' });
  }
});

// @route   GET /api/export/pickups/csv
// @desc    Export user's pickups as CSV
// @access  Private
router.get('/pickups/csv', authenticate, heavyOperationLimiter, async (req, res) => {
  try {
    const { status, from, to } = req.query;

    const where = { userId: req.user.id };
    if (status) where.status = status;
    if (from || to) {
      where.scheduledDate = {};
      if (from) where.scheduledDate.gte = new Date(from);
      if (to) where.scheduledDate.lte = new Date(to);
    }

    const pickups = await prisma.pickup.findMany({
      where,
      include: {
        items: {
          include: { package: true }
        }
      },
      orderBy: { scheduledDate: 'desc' },
    });

    const columns = [
      { header: 'Tracking Code', accessor: (row) => row.trackingCode },
      { header: 'Status', accessor: (row) => row.status },
      { header: 'Scheduled Date', accessor: (row) => formatDate(row.scheduledDate) },
      { header: 'Time Slot', accessor: (row) => row.scheduledSlot },
      { header: 'Address', accessor: (row) => row.address },
      { header: 'City', accessor: (row) => row.city },
      { header: 'State', accessor: (row) => row.state },
      { header: 'Zip Code', accessor: (row) => row.zipCode },
      { header: 'Total Items', accessor: (row) => row.totalItems },
      { header: 'Total Weight (kg)', accessor: (row) => row.totalWeight?.toFixed(2) },
      { header: 'Total Value ($)', accessor: (row) => row.totalValue?.toFixed(2) },
      { header: 'Reward Points', accessor: (row) => row.rewardPoints },
      { header: 'Completed At', accessor: (row) => formatDate(row.completedAt) },
      { header: 'Created At', accessor: (row) => formatDate(row.createdAt) },
    ];

    const csv = toCSV(pickups, columns);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="rebox-pickups-${formatDate(new Date())}.csv"`);
    res.send(csv);
  } catch (error) {
    console.error('Export pickups error:', error);
    res.status(500).json({ success: false, message: 'Failed to export pickups' });
  }
});

// @route   GET /api/export/transactions/csv
// @desc    Export user's reward transactions as CSV
// @access  Private
router.get('/transactions/csv', authenticate, heavyOperationLimiter, async (req, res) => {
  try {
    const { type, from, to } = req.query;

    const where = { userId: req.user.id };
    if (type) where.type = type;
    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = new Date(from);
      if (to) where.createdAt.lte = new Date(to);
    }

    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        pickup: {
          select: { trackingCode: true }
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    const columns = [
      { header: 'Date', accessor: (row) => formatDate(row.createdAt) },
      { header: 'Type', accessor: (row) => row.type },
      { header: 'Points', accessor: (row) => row.points },
      { header: 'Amount ($)', accessor: (row) => row.amount?.toFixed(2) },
      { header: 'Description', accessor: (row) => row.description },
      { header: 'Pickup Code', accessor: (row) => row.pickup?.trackingCode },
    ];

    const csv = toCSV(transactions, columns);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="rebox-transactions-${formatDate(new Date())}.csv"`);
    res.send(csv);
  } catch (error) {
    console.error('Export transactions error:', error);
    res.status(500).json({ success: false, message: 'Failed to export transactions' });
  }
});

// @route   GET /api/export/impact/csv
// @desc    Export user's environmental impact as CSV
// @access  Private
router.get('/impact/csv', authenticate, heavyOperationLimiter, async (req, res) => {
  try {
    const impactStats = await prisma.impactStats.findUnique({
      where: { userId: req.user.id },
    });

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { name: true, email: true, createdAt: true }
    });

    // Calculate monthly breakdown if possible
    const monthlyData = await prisma.package.groupBy({
      by: ['createdAt'],
      where: { 
        userId: req.user.id,
        status: { in: ['RECYCLED', 'REUSED', 'PICKED_UP'] }
      },
      _sum: {
        co2Saved: true,
        waterSaved: true,
        weight: true
      },
      _count: true
    });

    // Create summary report
    const summaryData = [{
      metric: 'Total Packages',
      value: impactStats?.totalPackages || 0,
      unit: 'packages'
    }, {
      metric: 'Total Weight Recycled',
      value: impactStats?.totalWeight?.toFixed(2) || 0,
      unit: 'kg'
    }, {
      metric: 'CO2 Emissions Saved',
      value: impactStats?.co2Saved?.toFixed(2) || 0,
      unit: 'kg CO2'
    }, {
      metric: 'Water Saved',
      value: impactStats?.waterSaved?.toFixed(2) || 0,
      unit: 'liters'
    }, {
      metric: 'Trees Equivalent',
      value: impactStats?.treesEquivalent?.toFixed(2) || 0,
      unit: 'trees'
    }, {
      metric: 'Landfill Diverted',
      value: impactStats?.landfillDiverted?.toFixed(2) || 0,
      unit: 'kg'
    }];

    const columns = [
      { header: 'Metric', accessor: (row) => row.metric },
      { header: 'Value', accessor: (row) => row.value },
      { header: 'Unit', accessor: (row) => row.unit },
    ];

    let csv = `ReBox Environmental Impact Report\n`;
    csv += `User: ${user?.name}\n`;
    csv += `Email: ${user?.email}\n`;
    csv += `Member Since: ${formatDate(user?.createdAt)}\n`;
    csv += `Report Generated: ${formatDate(new Date())}\n\n`;
    csv += toCSV(summaryData, columns);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="rebox-impact-report-${formatDate(new Date())}.csv"`);
    res.send(csv);
  } catch (error) {
    console.error('Export impact error:', error);
    res.status(500).json({ success: false, message: 'Failed to export impact report' });
  }
});

// @route   GET /api/export/impact/json
// @desc    Export complete user data as JSON (GDPR export)
// @access  Private
router.get('/user-data/json', authenticate, heavyOperationLimiter, async (req, res) => {
  try {
    const userData = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        packages: true,
        pickupsAsUser: {
          include: {
            items: true
          }
        },
        rewards: true,
        transactions: true,
        impactStats: true,
        notifications: true,
      }
    });

    // Remove sensitive fields
    const { password, resetToken, resetExpires, verifyToken, verifyExpires, ...safeUserData } = userData;

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="rebox-user-data-${formatDate(new Date())}.json"`);
    res.json({
      exportDate: new Date().toISOString(),
      user: safeUserData
    });
  } catch (error) {
    console.error('Export user data error:', error);
    res.status(500).json({ success: false, message: 'Failed to export user data' });
  }
});

// @route   GET /api/export/admin/report
// @desc    Generate admin analytics report (Admin only)
// @access  Private (Admin)
router.get('/admin/report', authenticate, heavyOperationLimiter, async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    const { from, to } = req.query;
    const dateFilter = {};
    if (from) dateFilter.gte = new Date(from);
    if (to) dateFilter.lte = new Date(to);

    // Get comprehensive stats
    const [
      userStats,
      packageStats,
      pickupStats,
      impactTotals
    ] = await Promise.all([
      prisma.user.groupBy({
        by: ['role'],
        _count: true
      }),
      prisma.package.groupBy({
        by: ['status', 'type'],
        _count: true,
        _sum: { estimatedValue: true, weight: true }
      }),
      prisma.pickup.groupBy({
        by: ['status'],
        _count: true,
        _sum: { totalValue: true, rewardPoints: true }
      }),
      prisma.impactStats.aggregate({
        _sum: {
          totalPackages: true,
          totalWeight: true,
          co2Saved: true,
          waterSaved: true,
          treesEquivalent: true,
          landfillDiverted: true
        }
      })
    ]);

    const report = {
      generatedAt: new Date().toISOString(),
      period: { from: from || 'All time', to: to || 'Present' },
      userStatistics: userStats.map(s => ({
        role: s.role,
        count: s._count
      })),
      packageStatistics: packageStats,
      pickupStatistics: pickupStats,
      environmentalImpact: impactTotals._sum
    };

    // Return as JSON or CSV based on format query param
    const format = req.query.format || 'json';

    if (format === 'csv') {
      let csv = `ReBox Admin Report\n`;
      csv += `Generated: ${report.generatedAt}\n\n`;
      
      csv += `User Statistics\n`;
      csv += `Role,Count\n`;
      report.userStatistics.forEach(s => {
        csv += `${s.role},${s.count}\n`;
      });

      csv += `\nEnvironmental Impact Totals\n`;
      csv += `Metric,Value\n`;
      Object.entries(report.environmentalImpact).forEach(([key, value]) => {
        csv += `${key},${value || 0}\n`;
      });

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="rebox-admin-report-${formatDate(new Date())}.csv"`);
      res.send(csv);
    } else {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="rebox-admin-report-${formatDate(new Date())}.json"`);
      res.json(report);
    }
  } catch (error) {
    console.error('Admin report error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate admin report' });
  }
});

module.exports = router;
