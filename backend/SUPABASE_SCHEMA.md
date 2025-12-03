# Supabase Database Schema Setup

This file contains the SQL commands to create all database tables, enums, indexes, and relationships for the ReBox application.

## Instructions

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/qxowgfdreqzqtbsoeqlu
2. Click on **SQL Editor** in the left sidebar
3. Click **New query**
4. Copy the entire SQL below and paste it into the editor
5. Click **Run** (or press Cmd/Ctrl + Enter)
6. You should see "Success. No rows returned" message

## SQL Schema

```sql
-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('INDIVIDUAL', 'BUSINESS', 'RECYCLER', 'ADMIN');

-- CreateEnum
CREATE TYPE "PackageType" AS ENUM ('BOX', 'BOTTLE', 'CONTAINER', 'BAG', 'OTHER');

-- CreateEnum
CREATE TYPE "PackageCondition" AS ENUM ('EXCELLENT', 'GOOD', 'FAIR', 'POOR');

-- CreateEnum
CREATE TYPE "PackageStatus" AS ENUM ('LISTED', 'SCHEDULED', 'PICKED_UP', 'PROCESSING', 'RECYCLED', 'REUSED');

-- CreateEnum
CREATE TYPE "PickupStatus" AS ENUM ('PENDING', 'CONFIRMED', 'IN_TRANSIT', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('PICKUP_REWARD', 'REFERRAL_BONUS', 'BRAND_BUYBACK', 'REDEMPTION');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'INDIVIDUAL',
    "avatar" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verifyToken" TEXT,
    "verifyExpires" TIMESTAMP(3),
    "resetToken" TEXT,
    "resetExpires" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "provider" TEXT,
    "providerId" TEXT,
    "providerData" JSONB,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zipCode" TEXT,
    "country" TEXT DEFAULT 'USA',
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "companyName" TEXT,
    "businessType" TEXT,
    "taxId" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Package" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "PackageType" NOT NULL,
    "condition" "PackageCondition" NOT NULL,
    "status" "PackageStatus" NOT NULL DEFAULT 'LISTED',
    "brand" TEXT,
    "description" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "weight" DOUBLE PRECISION,
    "dimensions" TEXT,
    "images" TEXT[],
    "estimatedValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "actualValue" DOUBLE PRECISION,
    "co2Saved" DOUBLE PRECISION,
    "waterSaved" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Package_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pickup" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "recyclerId" TEXT,
    "status" "PickupStatus" NOT NULL DEFAULT 'PENDING',
    "scheduledDate" TIMESTAMP(3) NOT NULL,
    "scheduledSlot" TEXT NOT NULL,
    "actualPickupTime" TIMESTAMP(3),
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zipCode" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "instructions" TEXT,
    "totalItems" INTEGER NOT NULL DEFAULT 0,
    "totalWeight" DOUBLE PRECISION,
    "totalValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "rewardPoints" INTEGER NOT NULL DEFAULT 0,
    "trackingCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "Pickup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PickupItem" (
    "id" TEXT NOT NULL,
    "pickupId" TEXT NOT NULL,
    "packageId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "PickupItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reward" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "totalPoints" INTEGER NOT NULL DEFAULT 0,
    "availablePoints" INTEGER NOT NULL DEFAULT 0,
    "lifetimePoints" INTEGER NOT NULL DEFAULT 0,
    "level" TEXT NOT NULL DEFAULT 'Bronze',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Reward_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "pickupId" TEXT,
    "type" "TransactionType" NOT NULL,
    "points" INTEGER NOT NULL,
    "amount" DOUBLE PRECISION,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImpactStats" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "totalPackages" INTEGER NOT NULL DEFAULT 0,
    "totalWeight" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "co2Saved" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "waterSaved" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "treesEquivalent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "landfillDiverted" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ImpactStats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BuybackOffer" (
    "id" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "packageId" TEXT NOT NULL,
    "offeredPrice" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "acceptedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "BuybackOffer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "data" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SustainabilityReport" (
    "id" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "totalUsers" INTEGER NOT NULL,
    "totalPackages" INTEGER NOT NULL,
    "totalPickups" INTEGER NOT NULL,
    "totalCO2Saved" DOUBLE PRECISION NOT NULL,
    "totalWaterSaved" DOUBLE PRECISION NOT NULL,
    "totalLandfillDiverted" DOUBLE PRECISION NOT NULL,
    "topBrands" JSONB,
    "topRecyclers" JSONB,
    "regionalData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SustainabilityReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_provider_providerId_idx" ON "User"("provider", "providerId");

-- CreateIndex
CREATE INDEX "Package_userId_idx" ON "Package"("userId");

-- CreateIndex
CREATE INDEX "Package_status_idx" ON "Package"("status");

-- CreateIndex
CREATE INDEX "Package_type_idx" ON "Package"("type");

-- CreateIndex
CREATE UNIQUE INDEX "Pickup_trackingCode_key" ON "Pickup"("trackingCode");

-- CreateIndex
CREATE INDEX "Pickup_userId_idx" ON "Pickup"("userId");

-- CreateIndex
CREATE INDEX "Pickup_recyclerId_idx" ON "Pickup"("recyclerId");

-- CreateIndex
CREATE INDEX "Pickup_status_idx" ON "Pickup"("status");

-- CreateIndex
CREATE INDEX "Pickup_scheduledDate_idx" ON "Pickup"("scheduledDate");

-- CreateIndex
CREATE UNIQUE INDEX "PickupItem_pickupId_packageId_key" ON "PickupItem"("pickupId", "packageId");

-- CreateIndex
CREATE UNIQUE INDEX "Reward_userId_key" ON "Reward"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_pickupId_key" ON "Transaction"("pickupId");

-- CreateIndex
CREATE INDEX "Transaction_userId_idx" ON "Transaction"("userId");

-- CreateIndex
CREATE INDEX "Transaction_type_idx" ON "Transaction"("type");

-- CreateIndex
CREATE UNIQUE INDEX "ImpactStats_userId_key" ON "ImpactStats"("userId");

-- CreateIndex
CREATE INDEX "BuybackOffer_brandId_idx" ON "BuybackOffer"("brandId");

-- CreateIndex
CREATE INDEX "BuybackOffer_packageId_idx" ON "BuybackOffer"("packageId");

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");

-- CreateIndex
CREATE INDEX "Notification_isRead_idx" ON "Notification"("isRead");

-- CreateIndex
CREATE UNIQUE INDEX "SustainabilityReport_period_key" ON "SustainabilityReport"("period");

-- AddForeignKey
ALTER TABLE "Package" ADD CONSTRAINT "Package_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pickup" ADD CONSTRAINT "Pickup_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pickup" ADD CONSTRAINT "Pickup_recyclerId_fkey" FOREIGN KEY ("recyclerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PickupItem" ADD CONSTRAINT "PickupItem_pickupId_fkey" FOREIGN KEY ("pickupId") REFERENCES "Pickup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PickupItem" ADD CONSTRAINT "PickupItem_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "Package"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reward" ADD CONSTRAINT "Reward_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_pickupId_fkey" FOREIGN KEY ("pickupId") REFERENCES "Pickup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImpactStats" ADD CONSTRAINT "ImpactStats_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BuybackOffer" ADD CONSTRAINT "BuybackOffer_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BuybackOffer" ADD CONSTRAINT "BuybackOffer_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "Package"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BuybackOffer" ADD CONSTRAINT "BuybackOffer_acceptedById_fkey" FOREIGN KEY ("acceptedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
```

## What This Creates

This SQL script creates:

### Enums (6 types):
- UserRole: INDIVIDUAL, BUSINESS, RECYCLER, ADMIN
- PackageType: BOX, BOTTLE, CONTAINER, BAG, OTHER
- PackageCondition: EXCELLENT, GOOD, FAIR, POOR
- PackageStatus: LISTED, SCHEDULED, PICKED_UP, PROCESSING, RECYCLED, REUSED
- PickupStatus: PENDING, CONFIRMED, IN_TRANSIT, COMPLETED, CANCELLED
- TransactionType: PICKUP_REWARD, REFERRAL_BONUS, BRAND_BUYBACK, REDEMPTION

### Tables (10 tables):
1. **User** - User accounts (individuals, businesses, recyclers, admins)
2. **Package** - Packaging items listed for recycling
3. **Pickup** - Scheduled pickup appointments
4. **PickupItem** - Junction table linking pickups to packages
5. **Reward** - User reward points and levels
6. **Transaction** - Point transactions history
7. **ImpactStats** - Environmental impact metrics per user
8. **BuybackOffer** - Brand buyback offers for packages
9. **Notification** - User notifications
10. **SustainabilityReport** - System-wide sustainability reports

### Indexes (22 indexes):
- Performance indexes on frequently queried fields
- Unique constraints on email, tracking codes, etc.

### Foreign Keys (13 relationships):
- All relationships between tables with proper CASCADE rules

## Verification

After running the SQL, you can verify the tables were created:

1. In Supabase Dashboard, go to **Table Editor**
2. You should see all 10 tables listed
3. Click on any table to see its structure

## Next Steps

After running this SQL:

1. Update Render build command to: `npm install && npx prisma generate`
2. Cancel the stuck deployment in Render
3. Deploy again - should complete in under 2 minutes
4. Once deployed, you can seed test data using the seed script

## Troubleshooting

**If you get errors about existing types:**
- Some enums might already exist
- You can drop them first: `DROP TYPE IF EXISTS "UserRole" CASCADE;`
- Then run the CREATE TYPE commands again

**If tables already exist:**
- Drop them first (WARNING: deletes all data): `DROP TABLE IF EXISTS "User" CASCADE;`
- Or skip to the next step if tables are correct
