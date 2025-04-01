/*
  Warnings:

  - You are about to drop the `_RegCoachToTeam` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_RegCoachToTeam" DROP CONSTRAINT "_RegCoachToTeam_A_fkey";

-- DropForeignKey
ALTER TABLE "_RegCoachToTeam" DROP CONSTRAINT "_RegCoachToTeam_B_fkey";

-- AlterTable
ALTER TABLE "Player" ALTER COLUMN "jerseyNum" SET DATA TYPE TEXT,
ALTER COLUMN "gradYear" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Tournament" ALTER COLUMN "title" SET DATA TYPE TEXT,
ALTER COLUMN "body" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "email" SET DATA TYPE TEXT,
ALTER COLUMN "phone" SET DATA TYPE TEXT,
ALTER COLUMN "pass" SET DATA TYPE TEXT,
ALTER COLUMN "fname" SET DATA TYPE TEXT,
ALTER COLUMN "lname" SET DATA TYPE TEXT;

-- DropTable
DROP TABLE "_RegCoachToTeam";
