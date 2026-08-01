-- CreateTable
CREATE TABLE "Counter" (
    "id" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "value" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Counter_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Counter_clinicId_idx" ON "Counter"("clinicId");

-- CreateIndex
CREATE UNIQUE INDEX "Counter_clinicId_type_key" ON "Counter"("clinicId", "type");

-- AddForeignKey
ALTER TABLE "Counter" ADD CONSTRAINT "Counter_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
