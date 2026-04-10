-- CreateTable
CREATE TABLE "HackathonConfig" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "checkinEventId" TEXT,

    CONSTRAINT "HackathonConfig_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "HackathonConfig" ADD CONSTRAINT "HackathonConfig_checkinEventId_fkey" FOREIGN KEY ("checkinEventId") REFERENCES "Event"("id") ON DELETE SET NULL ON UPDATE CASCADE;
