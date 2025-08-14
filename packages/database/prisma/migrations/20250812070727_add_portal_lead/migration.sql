-- CreateEnum
CREATE TYPE "LeadKind" AS ENUM ('PLAYER', 'PARENT');

-- CreateTable
CREATE TABLE "PortalLead" (
    "id" UUID NOT NULL,
    "kind" "LeadKind" NOT NULL,
    "playerFirstName" TEXT NOT NULL,
    "playerLastName" TEXT NOT NULL,
    "ageGroup" "AgeGroup" NOT NULL,
    "pos1" "Position",
    "pos2" "Position",
    "gradYear" TEXT,
    "parentFirstName" TEXT,
    "parentLastName" TEXT,
    "parentEmail" TEXT,
    "parentPhone" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "convertedPlayerId" UUID,

    CONSTRAINT "PortalLead_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PortalLead_convertedPlayerId_key" ON "PortalLead"("convertedPlayerId");

-- AddForeignKey
ALTER TABLE "PortalLead" ADD CONSTRAINT "PortalLead_convertedPlayerId_fkey" FOREIGN KEY ("convertedPlayerId") REFERENCES "Player"("id") ON DELETE SET NULL ON UPDATE CASCADE;
