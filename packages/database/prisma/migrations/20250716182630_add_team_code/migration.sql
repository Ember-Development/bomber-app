/*
  Warnings:

  - A unique constraint covering the columns `[teamCode]` on the table `Team` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Banner" ALTER COLUMN "expiresAt" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "expiresAt" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Team" ADD COLUMN     "teamCode" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Team_teamCode_key" ON "Team"("teamCode");
