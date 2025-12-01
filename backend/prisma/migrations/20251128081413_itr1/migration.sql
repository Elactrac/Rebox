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
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'INDIVIDUAL',
    "avatar" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
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
