/*
  Warnings:

  - You are about to drop the column `roomAssignment` on the `ReservationRequest` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ReservationRequest" DROP COLUMN "roomAssignment",
ADD COLUMN     "themedRoomId" TEXT;

-- CreateTable
CREATE TABLE "ThemedRoom" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,

    CONSTRAINT "ThemedRoom_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ReservationRequest" ADD CONSTRAINT "ReservationRequest_themedRoomId_fkey" FOREIGN KEY ("themedRoomId") REFERENCES "ThemedRoom"("id") ON DELETE SET NULL ON UPDATE CASCADE;
