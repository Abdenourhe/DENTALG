-- AlterTable
ALTER TABLE "Clinic" ADD COLUMN     "features" JSONB DEFAULT '{}';

-- CreateTable
CREATE TABLE "ClinicRequest" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "address" TEXT,
    "city" TEXT,
    "wilaya" TEXT,
    "ownerFirstName" TEXT NOT NULL,
    "ownerLastName" TEXT NOT NULL,
    "ownerEmail" TEXT NOT NULL,
    "ownerPassword" TEXT,
    "status" "RequestStatus" NOT NULL DEFAULT 'PENDING',
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClinicRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ClinicRequest_status_idx" ON "ClinicRequest"("status");

-- CreateIndex
CREATE INDEX "ClinicRequest_createdAt_idx" ON "ClinicRequest"("createdAt");
