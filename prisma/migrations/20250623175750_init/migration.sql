/*
  Warnings:

  - You are about to drop the column `propertyId` on the `Lease` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `city` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the column `state` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the column `units` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the column `zipCode` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the `MaintenanceRequest` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Tenant` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `roomId` to the `Lease` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Property` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Lease" DROP CONSTRAINT "Lease_propertyId_fkey";

-- DropForeignKey
ALTER TABLE "Lease" DROP CONSTRAINT "Lease_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "MaintenanceRequest" DROP CONSTRAINT "MaintenanceRequest_propertyId_fkey";

-- DropForeignKey
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_userId_fkey";

-- AlterTable
ALTER TABLE "Lease" DROP COLUMN "propertyId",
ADD COLUMN     "roomId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "userId",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "paidAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Property" DROP COLUMN "city",
DROP COLUMN "state",
DROP COLUMN "units",
DROP COLUMN "zipCode",
ADD COLUMN     "name" TEXT NOT NULL;

-- DropTable
DROP TABLE "MaintenanceRequest";

-- DropTable
DROP TABLE "Tenant";

-- CreateTable
CREATE TABLE "Room" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Room_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Room" ADD CONSTRAINT "Room_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lease" ADD CONSTRAINT "Lease_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lease" ADD CONSTRAINT "Lease_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
