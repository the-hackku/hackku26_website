/*
  Warnings:

  - Added the required column `authorName` to the `Announcement` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Announcement" ADD COLUMN     "authorName" TEXT NOT NULL;
