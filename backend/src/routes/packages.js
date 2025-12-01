const express = require('express');
const { body, validationResult, query } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const { authenticate, optionalAuth } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Calculate estimated value and environmental impact
const calculatePackageMetrics = (type, condition, quantity, weight) => {
  // Base values per kg by type
  const baseValues = {
    BOX: 0.5,
    BOTTLE: 0.8,
    CONTAINER: 0.6,
    BAG: 0.3,
    OTHER: 0.4
  };

  // Condition multipliers
  const conditionMultipliers = {
    EXCELLENT: 1.0,
    GOOD: 0.8,
    FAIR: 0.5,
    POOR: 0.2
  };

  // Environmental impact factors (per kg)
  const co2PerKg = 2.5; // kg CO2 saved
  const waterPerKg = 15; // liters water saved

  const baseValue = baseValues[type] || 0.4;
  const multiplier = conditionMultipliers[condition] || 0.5;
  const effectiveWeight = weight || quantity * 0.5; // estimate 0.5kg per item if no weight

  return {
    estimatedValue: parseFloat((baseValue * multiplier * effectiveWeight * quantity).toFixed(2)),
    co2Saved: parseFloat((co2PerKg * effectiveWeight).toFixed(2)),
    waterSaved: parseFloat((waterPerKg * effectiveWeight).toFixed(2))
  };
};

// @route   POST /api/packages
// @desc    Create a new package listing
// @access  Private
router.post('/', authenticate, [
  body('type').isIn(['BOX', 'BOTTLE', 'CONTAINER', 'BAG', 'OTHER']).withMessage('Invalid package type'),
  body('condition').isIn(['EXCELLENT', 'GOOD', 'FAIR', 'POOR']).withMessage('Invalid condition'),
  body('quantity').optional().isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('weight').optional().isFloat({ min: 0 }).withMessage('Weight must be positive'),
  body('brand').optional().trim(),
  body('description').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const { type, condition, quantity = 1, weight, brand, description, dimensions, images = [] } = req.body;

    // Calculate metrics
    const metrics = calculatePackageMetrics(type, condition, quantity, weight);

    const package_ = await prisma.package.create({
      data: {
        userId: req.user.id,
        type,
        condition,
        quantity,
        weight,
        brand,
        description,
        dimensions,
        images,
        estimatedValue: metrics.estimatedValue,
        co2Saved: metrics.co2Saved,
        waterSaved: metrics.waterSaved
      }
    });

    res.status(201).json({
      success: true,
      message: 'Package listed successfully',
      data: package_
    });
  } catch (error) {
    console.error('Create package error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create package' 
    });
  }
});

// @route   GET /api/packages
// @desc    Get all packages (with advanced search and filters)
// @access  Public (with optional auth)
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      type, 
      condition, 
      status,
      minValue,
      maxValue,
      minWeight,
      maxWeight,
      userId,
      myPackages,
      // New search parameters
      search,
      brand,
      city,
      state,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      // Date range filters
      createdAfter,
      createdBefore,
      // Multiple types/conditions
      types,
      conditions,
      statuses
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    
    // Filter by user's own packages
    if (myPackages === 'true' && req.user) {
      where.userId = req.user.id;
    } else if (userId) {
      where.userId = userId;
    }

    // Text search (searches in brand, description)
    if (search) {
      where.OR = [
        { brand: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Brand filter (exact or partial match)
    if (brand) {
      where.brand = { contains: brand, mode: 'insensitive' };
    }

    // Single type filter
    if (type) where.type = type;
    
    // Multiple types filter
    if (types) {
      const typeList = types.split(',').filter(t => ['BOX', 'BOTTLE', 'CONTAINER', 'BAG', 'OTHER'].includes(t));
      if (typeList.length > 0) {
        where.type = { in: typeList };
      }
    }

    // Single condition filter
    if (condition) where.condition = condition;
    
    // Multiple conditions filter
    if (conditions) {
      const conditionList = conditions.split(',').filter(c => ['EXCELLENT', 'GOOD', 'FAIR', 'POOR'].includes(c));
      if (conditionList.length > 0) {
        where.condition = { in: conditionList };
      }
    }

    // Single status filter
    if (status) where.status = status;
    
    // Multiple statuses filter
    if (statuses) {
      const statusList = statuses.split(',').filter(s => ['LISTED', 'SCHEDULED', 'PICKED_UP', 'PROCESSING', 'RECYCLED', 'REUSED'].includes(s));
      if (statusList.length > 0) {
        where.status = { in: statusList };
      }
    }

    // Value range filter
    if (minValue || maxValue) {
      where.estimatedValue = {};
      if (minValue) where.estimatedValue.gte = parseFloat(minValue);
      if (maxValue) where.estimatedValue.lte = parseFloat(maxValue);
    }

    // Weight range filter
    if (minWeight || maxWeight) {
      where.weight = {};
      if (minWeight) where.weight.gte = parseFloat(minWeight);
      if (maxWeight) where.weight.lte = parseFloat(maxWeight);
    }

    // Date range filter
    if (createdAfter || createdBefore) {
      where.createdAt = {};
      if (createdAfter) where.createdAt.gte = new Date(createdAfter);
      if (createdBefore) where.createdAt.lte = new Date(createdBefore);
    }

    // Location filters (requires join with user)
    const userWhere = {};
    if (city) userWhere.city = { contains: city, mode: 'insensitive' };
    if (state) userWhere.state = { contains: state, mode: 'insensitive' };

    if (Object.keys(userWhere).length > 0) {
      where.user = userWhere;
    }

    // Sorting
    const validSortFields = ['createdAt', 'estimatedValue', 'weight', 'quantity', 'updatedAt'];
    const orderByField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const orderByDirection = sortOrder === 'asc' ? 'asc' : 'desc';

    const [packages, total] = await Promise.all([
      prisma.package.findMany({
        where,
        skip,
        take: parseInt(limit),
        include: {
          user: {
            select: {
              id: true,
              name: true,
              city: true,
              state: true
            }
          },
          _count: {
            select: { buybackOffers: true }
          }
        },
        orderBy: { [orderByField]: orderByDirection }
      }),
      prisma.package.count({ where })
    ]);

    // Get aggregate stats for the filtered results
    const aggregates = await prisma.package.aggregate({
      where,
      _sum: {
        estimatedValue: true,
        weight: true,
        co2Saved: true,
        waterSaved: true
      },
      _avg: {
        estimatedValue: true,
        weight: true
      }
    });

    res.json({
      success: true,
      data: {
        packages,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        },
        aggregates: {
          totalValue: aggregates._sum.estimatedValue || 0,
          totalWeight: aggregates._sum.weight || 0,
          totalCO2Saved: aggregates._sum.co2Saved || 0,
          totalWaterSaved: aggregates._sum.waterSaved || 0,
          avgValue: aggregates._avg.estimatedValue || 0,
          avgWeight: aggregates._avg.weight || 0
        }
      }
    });
  } catch (error) {
    console.error('Get packages error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get packages' 
    });
  }
});

// @route   GET /api/packages/search
// @desc    Full-text search packages
// @access  Public
router.get('/search', optionalAuth, async (req, res) => {
  try {
    const { q, page = 1, limit = 20 } = req.query;

    if (!q || q.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters'
      });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Search in brand and description
    const where = {
      OR: [
        { brand: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
      ]
    };

    const [packages, total] = await Promise.all([
      prisma.package.findMany({
        where,
        skip,
        take: parseInt(limit),
        include: {
          user: {
            select: {
              id: true,
              name: true,
              city: true,
              state: true
            }
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
        query: q,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Search packages error:', error);
    res.status(500).json({
      success: false,
      message: 'Search failed'
    });
  }
});

// @route   GET /api/packages/filters/options
// @desc    Get available filter options (for dropdowns)
// @access  Public
router.get('/filters/options', async (req, res) => {
  try {
    // Get distinct brands
    const brands = await prisma.package.findMany({
      where: {
        brand: { not: null }
      },
      select: { brand: true },
      distinct: ['brand'],
      orderBy: { brand: 'asc' }
    });

    // Get distinct cities
    const cities = await prisma.user.findMany({
      where: {
        city: { not: null },
        packages: { some: {} }
      },
      select: { city: true },
      distinct: ['city'],
      orderBy: { city: 'asc' }
    });

    // Get distinct states
    const states = await prisma.user.findMany({
      where: {
        state: { not: null },
        packages: { some: {} }
      },
      select: { state: true },
      distinct: ['state'],
      orderBy: { state: 'asc' }
    });

    // Get value range
    const valueRange = await prisma.package.aggregate({
      _min: { estimatedValue: true },
      _max: { estimatedValue: true }
    });

    // Get weight range
    const weightRange = await prisma.package.aggregate({
      _min: { weight: true },
      _max: { weight: true }
    });

    // Get counts by type
    const typeCounts = await prisma.package.groupBy({
      by: ['type'],
      _count: { id: true }
    });

    // Get counts by condition
    const conditionCounts = await prisma.package.groupBy({
      by: ['condition'],
      _count: { id: true }
    });

    // Get counts by status
    const statusCounts = await prisma.package.groupBy({
      by: ['status'],
      _count: { id: true }
    });

    res.json({
      success: true,
      data: {
        brands: brands.map(b => b.brand).filter(Boolean),
        cities: cities.map(c => c.city).filter(Boolean),
        states: states.map(s => s.state).filter(Boolean),
        types: ['BOX', 'BOTTLE', 'CONTAINER', 'BAG', 'OTHER'],
        conditions: ['EXCELLENT', 'GOOD', 'FAIR', 'POOR'],
        statuses: ['LISTED', 'SCHEDULED', 'PICKED_UP', 'PROCESSING', 'RECYCLED', 'REUSED'],
        valueRange: {
          min: valueRange._min.estimatedValue || 0,
          max: valueRange._max.estimatedValue || 100
        },
        weightRange: {
          min: weightRange._min.weight || 0,
          max: weightRange._max.weight || 50
        },
        typeCounts: typeCounts.reduce((acc, item) => {
          acc[item.type] = item._count.id;
          return acc;
        }, {}),
        conditionCounts: conditionCounts.reduce((acc, item) => {
          acc[item.condition] = item._count.id;
          return acc;
        }, {}),
        statusCounts: statusCounts.reduce((acc, item) => {
          acc[item.status] = item._count.id;
          return acc;
        }, {})
      }
    });
  } catch (error) {
    console.error('Get filter options error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get filter options'
    });
  }
});

// @route   GET /api/packages/:id
// @desc    Get package by ID
// @access  Public
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const package_ = await prisma.package.findUnique({
      where: { id: req.params.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            city: true,
            state: true
          }
        },
        buybackOffers: {
          include: {
            brand: {
              select: {
                id: true,
                name: true,
                companyName: true
              }
            }
          },
          orderBy: { offeredPrice: 'desc' }
        }
      }
    });

    if (!package_) {
      return res.status(404).json({ 
        success: false, 
        message: 'Package not found' 
      });
    }

    res.json({
      success: true,
      data: package_
    });
  } catch (error) {
    console.error('Get package error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get package' 
    });
  }
});

// @route   PUT /api/packages/:id
// @desc    Update package
// @access  Private (owner only)
router.put('/:id', authenticate, async (req, res) => {
  try {
    const package_ = await prisma.package.findUnique({
      where: { id: req.params.id }
    });

    if (!package_) {
      return res.status(404).json({ 
        success: false, 
        message: 'Package not found' 
      });
    }

    if (package_.userId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to update this package' 
      });
    }

    // Can't update if already picked up
    if (['PICKED_UP', 'PROCESSING', 'RECYCLED', 'REUSED'].includes(package_.status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot update package after pickup' 
      });
    }

    const allowedFields = ['type', 'condition', 'quantity', 'weight', 'brand', 'description', 'dimensions', 'images'];
    const updateData = {};
    
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    // Recalculate metrics if relevant fields changed
    if (updateData.type || updateData.condition || updateData.quantity || updateData.weight) {
      const metrics = calculatePackageMetrics(
        updateData.type || package_.type,
        updateData.condition || package_.condition,
        updateData.quantity || package_.quantity,
        updateData.weight || package_.weight
      );
      updateData.estimatedValue = metrics.estimatedValue;
      updateData.co2Saved = metrics.co2Saved;
      updateData.waterSaved = metrics.waterSaved;
    }

    const updated = await prisma.package.update({
      where: { id: req.params.id },
      data: updateData
    });

    res.json({
      success: true,
      message: 'Package updated successfully',
      data: updated
    });
  } catch (error) {
    console.error('Update package error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update package' 
    });
  }
});

// @route   DELETE /api/packages/:id
// @desc    Delete package
// @access  Private (owner only)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const package_ = await prisma.package.findUnique({
      where: { id: req.params.id }
    });

    if (!package_) {
      return res.status(404).json({ 
        success: false, 
        message: 'Package not found' 
      });
    }

    if (package_.userId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to delete this package' 
      });
    }

    if (package_.status !== 'LISTED') {
      return res.status(400).json({ 
        success: false, 
        message: 'Can only delete packages with LISTED status' 
      });
    }

    await prisma.package.delete({
      where: { id: req.params.id }
    });

    res.json({
      success: true,
      message: 'Package deleted successfully'
    });
  } catch (error) {
    console.error('Delete package error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete package' 
    });
  }
});

// @route   GET /api/packages/stats/summary
// @desc    Get package statistics
// @access  Private
router.get('/stats/summary', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;

    const stats = await prisma.package.groupBy({
      by: ['type', 'status'],
      where: { userId },
      _count: { id: true },
      _sum: { estimatedValue: true, weight: true }
    });

    const totals = await prisma.package.aggregate({
      where: { userId },
      _count: { id: true },
      _sum: { 
        estimatedValue: true, 
        weight: true,
        co2Saved: true,
        waterSaved: true
      }
    });

    res.json({
      success: true,
      data: { stats, totals }
    });
  } catch (error) {
    console.error('Get package stats error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get package stats' 
    });
  }
});

module.exports = router;
