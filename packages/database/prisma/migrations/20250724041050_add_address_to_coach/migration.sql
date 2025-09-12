-- AlterTable
ALTER TABLE "Coach" ADD COLUMN     "addressID" UUID;

-- AddForeignKey
ALTER TABLE "Coach" ADD CONSTRAINT "Coach_addressID_fkey" FOREIGN KEY ("addressID") REFERENCES "Address"("id") ON DELETE SET NULL ON UPDATE CASCADE;
