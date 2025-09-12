-- AlterTable
ALTER TABLE "Player" ADD COLUMN     "commitId" UUID;

-- CreateTable
CREATE TABLE "Commit" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "state" "State" NOT NULL,
    "city" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "committedDate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Commit_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Player" ADD CONSTRAINT "Player_commitId_fkey" FOREIGN KEY ("commitId") REFERENCES "Commit"("id") ON DELETE SET NULL ON UPDATE CASCADE;
