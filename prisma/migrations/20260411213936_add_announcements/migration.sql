/*
  Warnings:

  - You are about to drop the column `body` on the `Announcement` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Announcement` table. All the data in the column will be lost.
  - Added the required column `content` to the `Announcement` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Announcement" DROP COLUMN "body",
DROP COLUMN "createdAt",
ADD COLUMN     "content" TEXT NOT NULL,
ALTER COLUMN "publishedAt" SET DEFAULT CURRENT_TIMESTAMP;
