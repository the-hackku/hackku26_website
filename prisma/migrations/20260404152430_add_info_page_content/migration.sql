-- CreateTable
CREATE TABLE "InfoPageContent" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "title" TEXT NOT NULL DEFAULT 'HackKU Hacker Doc',
    "content" TEXT NOT NULL DEFAULT '',
    "titleImageUrl" TEXT,
    "logoUrl" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InfoPageContent_pkey" PRIMARY KEY ("id")
);
