-- DropForeignKey
ALTER TABLE "Team" DROP CONSTRAINT "Team_headCoachID_fkey";

-- AlterTable
ALTER TABLE "Team" ALTER COLUMN "headCoachID" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_headCoachID_fkey" FOREIGN KEY ("headCoachID") REFERENCES "Coach"("id") ON DELETE SET NULL ON UPDATE CASCADE;
