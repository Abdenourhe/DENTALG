-- AlterEnum
ALTER TYPE "RequestStatus" ADD VALUE 'RETURNED';

-- AlterTable
ALTER TABLE "Clinic" ADD COLUMN     "paymentRequestedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "ClinicRequest" ADD COLUMN     "adminComment" TEXT,
ADD COLUMN     "assistantCount" INTEGER,
ADD COLUMN     "doctorCount" INTEGER,
ADD COLUMN     "equipmentNeeds" TEXT,
ADD COLUMN     "requestedPlan" "Plan" NOT NULL DEFAULT 'FREE',
ADD COLUMN     "secretaryCount" INTEGER,
ADD COLUMN     "specialty" TEXT;
