-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "failedToSend" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "retryCount" INTEGER NOT NULL DEFAULT 0;
