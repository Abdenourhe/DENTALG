-- CreateEnum
CREATE TYPE "ListingStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'SOLD');

-- CreateTable
CREATE TABLE "ClinicListing" (
    "id" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" INTEGER NOT NULL DEFAULT 0,
    "location" TEXT,
    "city" TEXT,
    "wilaya" TEXT,
    "photos" TEXT[],
    "status" "ListingStatus" NOT NULL DEFAULT 'DRAFT',
    "contactPhone" TEXT,
    "contactEmail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "ClinicListing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EquipmentListing" (
    "id" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" INTEGER NOT NULL DEFAULT 0,
    "condition" TEXT,
    "brand" TEXT,
    "photos" TEXT[],
    "status" "ListingStatus" NOT NULL DEFAULT 'DRAFT',
    "contactPhone" TEXT,
    "contactEmail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "EquipmentListing_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ClinicListing_clinicId_idx" ON "ClinicListing"("clinicId");

-- CreateIndex
CREATE INDEX "ClinicListing_status_idx" ON "ClinicListing"("status");

-- CreateIndex
CREATE INDEX "ClinicListing_createdAt_idx" ON "ClinicListing"("createdAt");

-- CreateIndex
CREATE INDEX "EquipmentListing_clinicId_idx" ON "EquipmentListing"("clinicId");

-- CreateIndex
CREATE INDEX "EquipmentListing_status_idx" ON "EquipmentListing"("status");

-- CreateIndex
CREATE INDEX "EquipmentListing_createdAt_idx" ON "EquipmentListing"("createdAt");

-- AddForeignKey
ALTER TABLE "ClinicListing" ADD CONSTRAINT "ClinicListing_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EquipmentListing" ADD CONSTRAINT "EquipmentListing_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
