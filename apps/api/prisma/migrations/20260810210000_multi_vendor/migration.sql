-- CreateEnum
CREATE TYPE "VendorFulfillmentStatus" AS ENUM ('PENDING', 'ACCEPTED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PayoutStatus" AS ENUM ('PENDING', 'APPROVED', 'PAID', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ReviewTargetType" AS ENUM ('PRODUCT', 'VENDOR');

-- AlterTable DiscountCode
ALTER TABLE "DiscountCode" ADD COLUMN IF NOT EXISTS "minOrderAmount" DECIMAL(12,2);
ALTER TABLE "DiscountCode" ADD COLUMN IF NOT EXISTS "maxUses" INTEGER;
ALTER TABLE "DiscountCode" ADD COLUMN IF NOT EXISTS "usedCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "DiscountCode" ADD COLUMN IF NOT EXISTS "expiresAt" TIMESTAMP(3);

-- AlterTable Order
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "parentOrderId" TEXT;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "vendorId" TEXT;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "fulfillmentStatus" "VendorFulfillmentStatus" NOT NULL DEFAULT 'PENDING';
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "platformCommission" DECIMAL(12,2) NOT NULL DEFAULT 0;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "vendorEarnings" DECIMAL(12,2) NOT NULL DEFAULT 0;

-- AlterTable OrderLine
ALTER TABLE "OrderLine" ADD COLUMN IF NOT EXISTS "vendorId" TEXT;

-- CreateTable VendorProfile
CREATE TABLE IF NOT EXISTS "VendorProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "storeName" TEXT NOT NULL,
    "storeNameAr" TEXT,
    "slug" TEXT NOT NULL,
    "logoUrl" TEXT,
    "bannerUrl" TEXT,
    "description" TEXT,
    "descriptionAr" TEXT,
    "city" TEXT,
    "commercialRegister" TEXT,
    "shippingPolicy" TEXT,
    "returnPolicy" TEXT,
    "bankIban" TEXT,
    "bankName" TEXT,
    "commissionPercent" DECIMAL(5,2),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VendorProfile_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "VendorProfile_userId_key" ON "VendorProfile"("userId");
CREATE UNIQUE INDEX IF NOT EXISTS "VendorProfile_slug_key" ON "VendorProfile"("slug");
CREATE INDEX IF NOT EXISTS "VendorProfile_slug_idx" ON "VendorProfile"("slug");
CREATE INDEX IF NOT EXISTS "VendorProfile_active_idx" ON "VendorProfile"("active");

-- CreateTable PlatformSettings
CREATE TABLE IF NOT EXISTS "PlatformSettings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "defaultCommissionPercent" DECIMAL(5,2) NOT NULL DEFAULT 10,

    CONSTRAINT "PlatformSettings_pkey" PRIMARY KEY ("id")
);

INSERT INTO "PlatformSettings" ("id", "defaultCommissionPercent")
VALUES ('default', 10)
ON CONFLICT ("id") DO NOTHING;

-- CreateTable VendorPayout
CREATE TABLE IF NOT EXISTS "VendorPayout" (
    "id" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "status" "PayoutStatus" NOT NULL DEFAULT 'PENDING',
    "periodStart" TIMESTAMP(3),
    "periodEnd" TIMESTAMP(3),
    "note" TEXT,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VendorPayout_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "VendorPayout_vendorId_status_idx" ON "VendorPayout"("vendorId", "status");

-- CreateTable VendorPayoutEntry
CREATE TABLE IF NOT EXISTS "VendorPayoutEntry" (
    "id" TEXT NOT NULL,
    "payoutId" TEXT,
    "orderId" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "commission" DECIMAL(12,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VendorPayoutEntry_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "VendorPayoutEntry_orderId_key" ON "VendorPayoutEntry"("orderId");
CREATE INDEX IF NOT EXISTS "VendorPayoutEntry_vendorId_idx" ON "VendorPayoutEntry"("vendorId");

-- CreateTable Review
CREATE TABLE IF NOT EXISTS "Review" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "targetType" "ReviewTargetType" NOT NULL,
    "productId" TEXT,
    "vendorId" TEXT,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "Review_productId_idx" ON "Review"("productId");
CREATE INDEX IF NOT EXISTS "Review_vendorId_idx" ON "Review"("vendorId");
CREATE INDEX IF NOT EXISTS "Review_userId_productId_idx" ON "Review"("userId", "productId");

-- CreateTable PushToken
CREATE TABLE IF NOT EXISTS "PushToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "platform" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PushToken_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "PushToken_token_key" ON "PushToken"("token");
CREATE INDEX IF NOT EXISTS "PushToken_userId_idx" ON "PushToken"("userId");

-- Indexes / FKs for Order
CREATE INDEX IF NOT EXISTS "Order_vendorId_idx" ON "Order"("vendorId");
CREATE INDEX IF NOT EXISTS "Order_parentOrderId_idx" ON "Order"("parentOrderId");
CREATE INDEX IF NOT EXISTS "OrderLine_vendorId_idx" ON "OrderLine"("vendorId");
CREATE INDEX IF NOT EXISTS "Product_ownerId_idx" ON "Product"("ownerId");
CREATE INDEX IF NOT EXISTS "Product_status_idx" ON "Product"("status");

-- Foreign keys (ignore errors if already exist via DO blocks not available easily; Prisma apply handles)
ALTER TABLE "VendorProfile" DROP CONSTRAINT IF EXISTS "VendorProfile_userId_fkey";
ALTER TABLE "VendorProfile" ADD CONSTRAINT "VendorProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Order" DROP CONSTRAINT IF EXISTS "Order_parentOrderId_fkey";
ALTER TABLE "Order" ADD CONSTRAINT "Order_parentOrderId_fkey" FOREIGN KEY ("parentOrderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Order" DROP CONSTRAINT IF EXISTS "Order_vendorId_fkey";
ALTER TABLE "Order" ADD CONSTRAINT "Order_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "VendorPayout" DROP CONSTRAINT IF EXISTS "VendorPayout_vendorId_fkey";
ALTER TABLE "VendorPayout" ADD CONSTRAINT "VendorPayout_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "VendorPayoutEntry" DROP CONSTRAINT IF EXISTS "VendorPayoutEntry_payoutId_fkey";
ALTER TABLE "VendorPayoutEntry" ADD CONSTRAINT "VendorPayoutEntry_payoutId_fkey" FOREIGN KEY ("payoutId") REFERENCES "VendorPayout"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "VendorPayoutEntry" DROP CONSTRAINT IF EXISTS "VendorPayoutEntry_orderId_fkey";
ALTER TABLE "VendorPayoutEntry" ADD CONSTRAINT "VendorPayoutEntry_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Review" DROP CONSTRAINT IF EXISTS "Review_userId_fkey";
ALTER TABLE "Review" ADD CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Review" DROP CONSTRAINT IF EXISTS "Review_productId_fkey";
ALTER TABLE "Review" ADD CONSTRAINT "Review_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "PushToken" DROP CONSTRAINT IF EXISTS "PushToken_userId_fkey";
ALTER TABLE "PushToken" ADD CONSTRAINT "PushToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
