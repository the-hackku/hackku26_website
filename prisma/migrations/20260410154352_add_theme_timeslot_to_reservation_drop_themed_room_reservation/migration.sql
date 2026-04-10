/*
  Warnings:

  - You are about to drop the `ThemedRoomReservation` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "ReservationRequest" ADD COLUMN     "theme" "RoomTheme",
ADD COLUMN     "timeSlot" "TimeSlot";

-- DropTable
DROP TABLE "ThemedRoomReservation";
