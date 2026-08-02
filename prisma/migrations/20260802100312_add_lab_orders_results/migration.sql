-- CreateEnum
CREATE TYPE "LabOrderStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "LabResultStatus" AS ENUM ('PENDING', 'NORMAL', 'ABNORMAL', 'CRITICAL');

-- CreateTable
CREATE TABLE "LabOrder" (
    "id" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "status" "LabOrderStatus" NOT NULL DEFAULT 'PENDING',
    "orderedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "requestedTests" TEXT[],
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "LabOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LabResult" (
    "id" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "labOrderId" TEXT NOT NULL,
    "testName" TEXT NOT NULL,
    "value" TEXT,
    "unit" TEXT,
    "referenceRange" TEXT,
    "status" "LabResultStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "reportedAt" TIMESTAMP(3),
    "reportedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LabResult_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LabOrder_clinicId_idx" ON "LabOrder"("clinicId");

-- CreateIndex
CREATE INDEX "LabOrder_patientId_idx" ON "LabOrder"("patientId");

-- CreateIndex
CREATE INDEX "LabOrder_createdById_idx" ON "LabOrder"("createdById");

-- CreateIndex
CREATE INDEX "LabOrder_clinicId_orderedAt_idx" ON "LabOrder"("clinicId", "orderedAt");

-- CreateIndex
CREATE UNIQUE INDEX "LabOrder_clinicId_number_key" ON "LabOrder"("clinicId", "number");

-- CreateIndex
CREATE INDEX "LabResult_clinicId_idx" ON "LabResult"("clinicId");

-- CreateIndex
CREATE INDEX "LabResult_labOrderId_idx" ON "LabResult"("labOrderId");

-- CreateIndex
CREATE INDEX "LabResult_reportedById_idx" ON "LabResult"("reportedById");

-- AddForeignKey
ALTER TABLE "LabOrder" ADD CONSTRAINT "LabOrder_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LabOrder" ADD CONSTRAINT "LabOrder_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LabOrder" ADD CONSTRAINT "LabOrder_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LabResult" ADD CONSTRAINT "LabResult_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LabResult" ADD CONSTRAINT "LabResult_labOrderId_fkey" FOREIGN KEY ("labOrderId") REFERENCES "LabOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LabResult" ADD CONSTRAINT "LabResult_reportedById_fkey" FOREIGN KEY ("reportedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
