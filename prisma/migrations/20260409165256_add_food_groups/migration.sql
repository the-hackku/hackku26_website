-- AlterTable
ALTER TABLE "ParticipantInfo" ADD COLUMN     "foodGroup" INTEGER;

-- CreateTable
CREATE TABLE "FoodGroupConfig" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "numGroups" INTEGER NOT NULL DEFAULT 4,

    CONSTRAINT "FoodGroupConfig_pkey" PRIMARY KEY ("id")
);
