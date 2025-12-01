// Temporary seed endpoint - DELETE AFTER USE
const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();

router.post('/seed-database', async (req, res) => {
  try {
    const { prisma } = req;

    console.log('Seeding database...');

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 12);
    const admin = await prisma.user.upsert({
      where: { email: 'admin@rebox.com' },
      update: {},
      create: {
        email: 'admin@rebox.com',
        password: adminPassword,
        name: 'Admin User',
        role: 'ADMIN',
        isVerified: true,
        rewards: {
          create: { totalPoints: 0, availablePoints: 0, lifetimePoints: 0, level: 'Bronze' }
        },
        impactStats: {
          create: { totalPackages: 0, totalWeight: 0, co2Saved: 0, waterSaved: 0, treesEquivalent: 0, landfillDiverted: 0 }
        }
      }
    });

    // Create sample individual user
    const userPassword = await bcrypt.hash('user123', 12);
    const user = await prisma.user.upsert({
      where: { email: 'user@example.com' },
      update: {},
      create: {
        email: 'user@example.com',
        password: userPassword,
        name: 'John Doe',
        role: 'INDIVIDUAL',
        phone: '555-123-4567',
        address: '123 Green Street',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94102',
        isVerified: true,
        rewards: {
          create: { totalPoints: 500, availablePoints: 500, lifetimePoints: 500, level: 'Bronze' }
        },
        impactStats: {
          create: { totalPackages: 10, totalWeight: 5.5, co2Saved: 12.5, waterSaved: 150, treesEquivalent: 0.6, landfillDiverted: 5.5 }
        }
      }
    });

    // Create sample business user
    const businessPassword = await bcrypt.hash('business123', 12);
    const business = await prisma.user.upsert({
      where: { email: 'brand@example.com' },
      update: {},
      create: {
        email: 'brand@example.com',
        password: businessPassword,
        name: 'Jane Smith',
        role: 'BUSINESS',
        companyName: 'EcoBrand Inc.',
        businessType: 'Consumer Goods',
        phone: '555-987-6543',
        address: '456 Corporate Blvd',
        city: 'Los Angeles',
        state: 'CA',
        zipCode: '90001',
        isVerified: true,
        rewards: {
          create: { totalPoints: 0, availablePoints: 0, lifetimePoints: 0, level: 'Bronze' }
        },
        impactStats: {
          create: { totalPackages: 0, totalWeight: 0, co2Saved: 0, waterSaved: 0, treesEquivalent: 0, landfillDiverted: 0 }
        }
      }
    });

    // Create sample recycler
    const recyclerPassword = await bcrypt.hash('recycler123', 12);
    const recycler = await prisma.user.upsert({
      where: { email: 'recycler@example.com' },
      update: {},
      create: {
        email: 'recycler@example.com',
        password: recyclerPassword,
        name: 'Bob Wilson',
        role: 'RECYCLER',
        companyName: 'Green Recycling Co.',
        businessType: 'Recycling Services',
        phone: '555-456-7890',
        address: '789 Industrial Way',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94103',
        isVerified: true,
        rewards: {
          create: { totalPoints: 0, availablePoints: 0, lifetimePoints: 0, level: 'Bronze' }
        },
        impactStats: {
          create: { totalPackages: 0, totalWeight: 0, co2Saved: 0, waterSaved: 0, treesEquivalent: 0, landfillDiverted: 0 }
        }
      }
    });

    // Create sample packages for user
    const packages = await Promise.all([
      prisma.package.create({
        data: {
          userId: user.id,
          type: 'BOX',
          condition: 'EXCELLENT',
          quantity: 5,
          weight: 2.5,
          images: [],
          brand: 'Amazon',
          description: 'Various shipping boxes in great condition',
          estimatedValue: 6.25,
          co2Saved: 6.25,
          waterSaved: 37.5
        }
      }),
      prisma.package.create({
        data: {
          userId: user.id,
          type: 'BOTTLE',
          condition: 'GOOD',
          quantity: 10,
          weight: 1.0,
          images: [],
          brand: 'Generic',
          description: 'Glass bottles, cleaned and ready for reuse',
          estimatedValue: 6.40,
          co2Saved: 2.5,
          waterSaved: 15
        }
      }),
      prisma.package.create({
        data: {
          userId: user.id,
          type: 'CONTAINER',
          condition: 'GOOD',
          quantity: 3,
          weight: 0.5,
          images: [],
          description: 'Food containers in good condition',
          estimatedValue: 1.44,
          co2Saved: 1.25,
          waterSaved: 7.5
        }
      })
    ]);

    res.json({
      success: true,
      message: 'Database seeded successfully',
      accounts: {
        admin: 'admin@rebox.com / admin123',
        user: 'user@example.com / user123',
        business: 'brand@example.com / business123',
        recycler: 'recycler@example.com / recycler123'
      },
      created: {
        users: 4,
        packages: packages.length
      }
    });

  } catch (error) {
    console.error('Seeding error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
