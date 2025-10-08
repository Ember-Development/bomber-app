/*
  Warnings:

  - Added the required column `title` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `end` to the `Tournament` table without a default value. This is not possible if the table is not empty.
  - Added the required column `location` to the `Tournament` table without a default value. This is not possible if the table is not empty.
  - Added the required column `start` to the `Tournament` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "body" TEXT,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "title" TEXT NOT NULL DEFAULT 'Temp Default Event Title';

-- AlterTable
ALTER TABLE "Tournament" ADD COLUMN     "end" TIMESTAMP(3) NOT NULL DEFAULT '2025-09-12 00:00:00',
ADD COLUMN     "location" TEXT NOT NULL DEFAULT 'here',
ADD COLUMN     "start" TIMESTAMP(3) NOT NULL DEFAULT '2025-09-14 06:00:00';

ALTER TABLE "Event" ALTER COLUMN "title" DROP DEFAULT;
ALTER TABLE "Tournament" ALTER COLUMN "start" DROP DEFAULT;
ALTER TABLE "Tournament" ALTER COLUMN "end" DROP DEFAULT;
ALTER TABLE "Tournament" ALTER COLUMN "location" DROP DEFAULT;
