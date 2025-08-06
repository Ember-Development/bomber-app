-- DropForeignKey
ALTER TABLE "Player" DROP CONSTRAINT "Player_teamID_fkey";

-- AlterTable
ALTER TABLE "Player" ALTER COLUMN "teamID" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Player" ADD CONSTRAINT "Player_teamID_fkey" FOREIGN KEY ("teamID") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;
