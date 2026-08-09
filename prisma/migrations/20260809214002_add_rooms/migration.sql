-- AlterTable
ALTER TABLE "WaitingRoomEntry" ADD COLUMN     "roomId" TEXT;

-- CreateTable
CREATE TABLE "Room" (
    "id" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Room_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Room_clinicId_idx" ON "Room"("clinicId");

-- CreateIndex
CREATE INDEX "Room_clinicId_order_idx" ON "Room"("clinicId", "order");

-- CreateIndex
CREATE INDEX "WaitingRoomEntry_roomId_idx" ON "WaitingRoomEntry"("roomId");

-- AddForeignKey
ALTER TABLE "WaitingRoomEntry" ADD CONSTRAINT "WaitingRoomEntry_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Room" ADD CONSTRAINT "Room_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
