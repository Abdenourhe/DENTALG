-- CreateEnum
CREATE TYPE "WaitingRoomStatus" AS ENUM ('WAITING', 'CALLED', 'IN_PROGRESS', 'COMPLETED', 'NO_SHOW');

-- CreateEnum
CREATE TYPE "WaitingRoomPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH');

-- CreateTable
CREATE TABLE "WaitingRoomEntry" (
    "id" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "appointmentId" TEXT,
    "dentistId" TEXT,
    "status" "WaitingRoomStatus" NOT NULL DEFAULT 'WAITING',
    "priority" "WaitingRoomPriority" NOT NULL DEFAULT 'NORMAL',
    "arrivalType" TEXT NOT NULL DEFAULT 'WALK_IN',
    "notes" TEXT,
    "arrivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "calledAt" TIMESTAMP(3),
    "calledById" TEXT,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "WaitingRoomEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WaitingRoomEntry_clinicId_status_idx" ON "WaitingRoomEntry"("clinicId", "status");

-- CreateIndex
CREATE INDEX "WaitingRoomEntry_clinicId_arrivedAt_idx" ON "WaitingRoomEntry"("clinicId", "arrivedAt");

-- CreateIndex
CREATE INDEX "WaitingRoomEntry_patientId_idx" ON "WaitingRoomEntry"("patientId");

-- CreateIndex
CREATE INDEX "WaitingRoomEntry_appointmentId_idx" ON "WaitingRoomEntry"("appointmentId");

-- AddForeignKey
ALTER TABLE "WaitingRoomEntry" ADD CONSTRAINT "WaitingRoomEntry_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WaitingRoomEntry" ADD CONSTRAINT "WaitingRoomEntry_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WaitingRoomEntry" ADD CONSTRAINT "WaitingRoomEntry_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WaitingRoomEntry" ADD CONSTRAINT "WaitingRoomEntry_dentistId_fkey" FOREIGN KEY ("dentistId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WaitingRoomEntry" ADD CONSTRAINT "WaitingRoomEntry_calledById_fkey" FOREIGN KEY ("calledById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WaitingRoomEntry" ADD CONSTRAINT "WaitingRoomEntry_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
