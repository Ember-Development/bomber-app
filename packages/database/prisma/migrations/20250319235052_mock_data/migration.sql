/*
  Warnings:

  - The values [NORTHWEST,SOUTHWEST,SOUTH,SOUTHEAST,NORTHEAST,MIDWEST] on the enum `Regions` will be removed. If these variants are still used in the database, this will fail.
  - The primary key for the `Address` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Admin` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Chat` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Coach` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Event` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `tournamentID` column on the `Event` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `EventAttendance` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Fan` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Message` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Notification` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Parent` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Player` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `userID` column on the `Player` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `addressID` column on the `Player` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `RegCoach` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Team` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `headCoachID` column on the `Team` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Tournament` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Trophy` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `phone` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `UserNotification` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `_CoachTeams` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `_ParentToPlayer` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the `_ChatToUser` table. If the table is not empty, all the data it contains will be lost.
  - Changed the type of `id` on the `Address` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `Admin` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `userID` on the `Admin` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `createdAt` to the `Chat` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `id` on the `Chat` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `Coach` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `userID` on the `Coach` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `Event` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `EventAttendance` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `userID` on the `EventAttendance` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `eventID` on the `EventAttendance` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `Fan` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `userID` on the `Fan` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `Message` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `userID` on the `Message` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `chatID` on the `Message` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `Notification` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `Parent` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `addressID` on the `Parent` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `userID` on the `Parent` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `Player` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `jerseyNum` on the `Player` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `gradYear` on the `Player` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `jerseySize` on the `Player` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `pantSize` on the `Player` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `stirrupSize` on the `Player` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `shortSize` on the `Player` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `practiceShortSize` on the `Player` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `teamID` on the `Player` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `RegCoach` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `userID` on the `RegCoach` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `Team` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `Tournament` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `title` on the `Tournament` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `body` on the `Tournament` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `Trophy` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `teamID` on the `Trophy` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `User` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `email` to the `User` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `pass` on the `User` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `fname` on the `User` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `lname` on the `User` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `userID` on the `UserNotification` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `notificationID` on the `UserNotification` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `A` on the `_CoachTeams` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `B` on the `_CoachTeams` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `A` on the `_ParentToPlayer` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `B` on the `_ParentToPlayer` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "PantsSize" AS ENUM ('SIZE_20', 'SIZE_22', 'SIZE_24', 'SIZE_26', 'SIZE_30', 'SIZE_32', 'SIZE_33', 'SIZE_34', 'SIZE_36', 'SIZE_38');

-- CreateEnum
CREATE TYPE "JerseySize" AS ENUM ('YXS', 'YS', 'YM', 'YL', 'YXL', 'AS', 'AM', 'AL', 'AXL', 'A2XL');

-- CreateEnum
CREATE TYPE "StirrupSize" AS ENUM ('SM', 'LG', 'XL');

-- CreateEnum
CREATE TYPE "ShortsSize" AS ENUM ('YXL', 'ASM', 'AMD', 'ALG', 'AXL', 'A2XL');

-- AlterEnum
BEGIN;
CREATE TYPE "Regions_new" AS ENUM ('NW', 'SW', 'S', 'SE', 'NE', 'MW');
ALTER TABLE "RegCoach" ALTER COLUMN "region" TYPE "Regions_new" USING ("region"::text::"Regions_new");
ALTER TABLE "Team" ALTER COLUMN "region" TYPE "Regions_new" USING ("region"::text::"Regions_new");
ALTER TYPE "Regions" RENAME TO "Regions_old";
ALTER TYPE "Regions_new" RENAME TO "Regions";
DROP TYPE "Regions_old";
COMMIT;

-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'PARENT';

-- DropForeignKey
ALTER TABLE "Admin" DROP CONSTRAINT "Admin_userID_fkey";

-- DropForeignKey
ALTER TABLE "Coach" DROP CONSTRAINT "Coach_userID_fkey";

-- DropForeignKey
ALTER TABLE "Event" DROP CONSTRAINT "Event_tournamentID_fkey";

-- DropForeignKey
ALTER TABLE "EventAttendance" DROP CONSTRAINT "EventAttendance_eventID_fkey";

-- DropForeignKey
ALTER TABLE "EventAttendance" DROP CONSTRAINT "EventAttendance_userID_fkey";

-- DropForeignKey
ALTER TABLE "Fan" DROP CONSTRAINT "Fan_userID_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_chatID_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_userID_fkey";

-- DropForeignKey
ALTER TABLE "Parent" DROP CONSTRAINT "Parent_addressID_fkey";

-- DropForeignKey
ALTER TABLE "Parent" DROP CONSTRAINT "Parent_userID_fkey";

-- DropForeignKey
ALTER TABLE "Player" DROP CONSTRAINT "Player_addressID_fkey";

-- DropForeignKey
ALTER TABLE "Player" DROP CONSTRAINT "Player_teamID_fkey";

-- DropForeignKey
ALTER TABLE "Player" DROP CONSTRAINT "Player_userID_fkey";

-- DropForeignKey
ALTER TABLE "RegCoach" DROP CONSTRAINT "RegCoach_userID_fkey";

-- DropForeignKey
ALTER TABLE "Team" DROP CONSTRAINT "Team_headCoachID_fkey";

-- DropForeignKey
ALTER TABLE "Trophy" DROP CONSTRAINT "Trophy_teamID_fkey";

-- DropForeignKey
ALTER TABLE "UserNotification" DROP CONSTRAINT "UserNotification_notificationID_fkey";

-- DropForeignKey
ALTER TABLE "UserNotification" DROP CONSTRAINT "UserNotification_userID_fkey";

-- DropForeignKey
ALTER TABLE "_ChatToUser" DROP CONSTRAINT "_ChatToUser_A_fkey";

-- DropForeignKey
ALTER TABLE "_ChatToUser" DROP CONSTRAINT "_ChatToUser_B_fkey";

-- DropForeignKey
ALTER TABLE "_CoachTeams" DROP CONSTRAINT "_CoachTeams_A_fkey";

-- DropForeignKey
ALTER TABLE "_CoachTeams" DROP CONSTRAINT "_CoachTeams_B_fkey";

-- DropForeignKey
ALTER TABLE "_ParentToPlayer" DROP CONSTRAINT "_ParentToPlayer_A_fkey";

-- DropForeignKey
ALTER TABLE "_ParentToPlayer" DROP CONSTRAINT "_ParentToPlayer_B_fkey";

-- AlterTable
ALTER TABLE "Address" DROP CONSTRAINT "Address_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
ADD CONSTRAINT "Address_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Admin" DROP CONSTRAINT "Admin_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
DROP COLUMN "userID",
ADD COLUMN     "userID" UUID NOT NULL,
ADD CONSTRAINT "Admin_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Chat" DROP CONSTRAINT "Chat_pkey",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
ADD CONSTRAINT "Chat_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Coach" DROP CONSTRAINT "Coach_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
DROP COLUMN "userID",
ADD COLUMN     "userID" UUID NOT NULL,
ADD CONSTRAINT "Coach_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Event" DROP CONSTRAINT "Event_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
DROP COLUMN "tournamentID",
ADD COLUMN     "tournamentID" UUID,
ADD CONSTRAINT "Event_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "EventAttendance" DROP CONSTRAINT "EventAttendance_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
DROP COLUMN "userID",
ADD COLUMN     "userID" UUID NOT NULL,
DROP COLUMN "eventID",
ADD COLUMN     "eventID" UUID NOT NULL,
ADD CONSTRAINT "EventAttendance_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Fan" DROP CONSTRAINT "Fan_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
DROP COLUMN "userID",
ADD COLUMN     "userID" UUID NOT NULL,
ADD CONSTRAINT "Fan_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Message" DROP CONSTRAINT "Message_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
DROP COLUMN "userID",
ADD COLUMN     "userID" UUID NOT NULL,
DROP COLUMN "chatID",
ADD COLUMN     "chatID" UUID NOT NULL,
ADD CONSTRAINT "Message_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
ADD CONSTRAINT "Notification_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Parent" DROP CONSTRAINT "Parent_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
DROP COLUMN "addressID",
ADD COLUMN     "addressID" UUID NOT NULL,
DROP COLUMN "userID",
ADD COLUMN     "userID" UUID NOT NULL,
ADD CONSTRAINT "Parent_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Player" DROP CONSTRAINT "Player_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
DROP COLUMN "jerseyNum",
ADD COLUMN     "jerseyNum" UUID NOT NULL,
DROP COLUMN "gradYear",
ADD COLUMN     "gradYear" UUID NOT NULL,
DROP COLUMN "jerseySize",
ADD COLUMN     "jerseySize" "JerseySize" NOT NULL,
DROP COLUMN "pantSize",
ADD COLUMN     "pantSize" "PantsSize" NOT NULL,
DROP COLUMN "stirrupSize",
ADD COLUMN     "stirrupSize" "StirrupSize" NOT NULL,
DROP COLUMN "shortSize",
ADD COLUMN     "shortSize" "ShortsSize" NOT NULL,
DROP COLUMN "practiceShortSize",
ADD COLUMN     "practiceShortSize" "ShortsSize" NOT NULL,
DROP COLUMN "userID",
ADD COLUMN     "userID" UUID,
DROP COLUMN "teamID",
ADD COLUMN     "teamID" UUID NOT NULL,
DROP COLUMN "addressID",
ADD COLUMN     "addressID" UUID,
ADD CONSTRAINT "Player_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "RegCoach" DROP CONSTRAINT "RegCoach_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
DROP COLUMN "userID",
ADD COLUMN     "userID" UUID NOT NULL,
ADD CONSTRAINT "RegCoach_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Team" DROP CONSTRAINT "Team_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
DROP COLUMN "headCoachID",
ADD COLUMN     "headCoachID" UUID,
ADD CONSTRAINT "Team_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Tournament" DROP CONSTRAINT "Tournament_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
DROP COLUMN "title",
ADD COLUMN     "title" UUID NOT NULL,
DROP COLUMN "body",
ADD COLUMN     "body" UUID NOT NULL,
ADD CONSTRAINT "Tournament_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Trophy" DROP CONSTRAINT "Trophy_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
DROP COLUMN "teamID",
ADD COLUMN     "teamID" UUID NOT NULL,
ADD CONSTRAINT "Trophy_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
DROP COLUMN "email",
ADD COLUMN     "email" UUID NOT NULL,
DROP COLUMN "phone",
ADD COLUMN     "phone" UUID,
DROP COLUMN "pass",
ADD COLUMN     "pass" UUID NOT NULL,
DROP COLUMN "fname",
ADD COLUMN     "fname" UUID NOT NULL,
DROP COLUMN "lname",
ADD COLUMN     "lname" UUID NOT NULL,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "UserNotification" DROP CONSTRAINT "UserNotification_pkey",
DROP COLUMN "userID",
ADD COLUMN     "userID" UUID NOT NULL,
DROP COLUMN "notificationID",
ADD COLUMN     "notificationID" UUID NOT NULL,
ADD CONSTRAINT "UserNotification_pkey" PRIMARY KEY ("userID", "notificationID");

-- AlterTable
ALTER TABLE "_CoachTeams" DROP CONSTRAINT "_CoachTeams_AB_pkey",
DROP COLUMN "A",
ADD COLUMN     "A" UUID NOT NULL,
DROP COLUMN "B",
ADD COLUMN     "B" UUID NOT NULL,
ADD CONSTRAINT "_CoachTeams_AB_pkey" PRIMARY KEY ("A", "B");

-- AlterTable
ALTER TABLE "_ParentToPlayer" DROP CONSTRAINT "_ParentToPlayer_AB_pkey",
DROP COLUMN "A",
ADD COLUMN     "A" UUID NOT NULL,
DROP COLUMN "B",
ADD COLUMN     "B" UUID NOT NULL,
ADD CONSTRAINT "_ParentToPlayer_AB_pkey" PRIMARY KEY ("A", "B");

-- DropTable
DROP TABLE "_ChatToUser";

-- DropEnum
DROP TYPE "UniformSize";

-- CreateTable
CREATE TABLE "UserChat" (
    "userID" UUID NOT NULL,
    "chatID" UUID NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserChat_pkey" PRIMARY KEY ("userID","chatID")
);

-- CreateTable
CREATE TABLE "_RegCoachToTeam" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_RegCoachToTeam_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_RegCoachToTeam_B_index" ON "_RegCoachToTeam"("B");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_userID_key" ON "Admin"("userID");

-- CreateIndex
CREATE UNIQUE INDEX "Coach_userID_key" ON "Coach"("userID");

-- CreateIndex
CREATE UNIQUE INDEX "EventAttendance_userID_eventID_key" ON "EventAttendance"("userID", "eventID");

-- CreateIndex
CREATE UNIQUE INDEX "Fan_userID_key" ON "Fan"("userID");

-- CreateIndex
CREATE UNIQUE INDEX "Parent_userID_key" ON "Parent"("userID");

-- CreateIndex
CREATE UNIQUE INDEX "Player_userID_key" ON "Player"("userID");

-- CreateIndex
CREATE UNIQUE INDEX "RegCoach_userID_key" ON "RegCoach"("userID");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "_CoachTeams_B_index" ON "_CoachTeams"("B");

-- CreateIndex
CREATE INDEX "_ParentToPlayer_B_index" ON "_ParentToPlayer"("B");

-- AddForeignKey
ALTER TABLE "Player" ADD CONSTRAINT "Player_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Player" ADD CONSTRAINT "Player_teamID_fkey" FOREIGN KEY ("teamID") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Player" ADD CONSTRAINT "Player_addressID_fkey" FOREIGN KEY ("addressID") REFERENCES "Address"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Admin" ADD CONSTRAINT "Admin_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Fan" ADD CONSTRAINT "Fan_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Coach" ADD CONSTRAINT "Coach_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegCoach" ADD CONSTRAINT "RegCoach_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_headCoachID_fkey" FOREIGN KEY ("headCoachID") REFERENCES "Coach"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trophy" ADD CONSTRAINT "Trophy_teamID_fkey" FOREIGN KEY ("teamID") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Parent" ADD CONSTRAINT "Parent_addressID_fkey" FOREIGN KEY ("addressID") REFERENCES "Address"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Parent" ADD CONSTRAINT "Parent_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserChat" ADD CONSTRAINT "UserChat_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserChat" ADD CONSTRAINT "UserChat_chatID_fkey" FOREIGN KEY ("chatID") REFERENCES "Chat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_chatID_fkey" FOREIGN KEY ("chatID") REFERENCES "Chat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserNotification" ADD CONSTRAINT "UserNotification_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserNotification" ADD CONSTRAINT "UserNotification_notificationID_fkey" FOREIGN KEY ("notificationID") REFERENCES "Notification"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_tournamentID_fkey" FOREIGN KEY ("tournamentID") REFERENCES "Tournament"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventAttendance" ADD CONSTRAINT "EventAttendance_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventAttendance" ADD CONSTRAINT "EventAttendance_eventID_fkey" FOREIGN KEY ("eventID") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CoachTeams" ADD CONSTRAINT "_CoachTeams_A_fkey" FOREIGN KEY ("A") REFERENCES "Coach"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CoachTeams" ADD CONSTRAINT "_CoachTeams_B_fkey" FOREIGN KEY ("B") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RegCoachToTeam" ADD CONSTRAINT "_RegCoachToTeam_A_fkey" FOREIGN KEY ("A") REFERENCES "RegCoach"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RegCoachToTeam" ADD CONSTRAINT "_RegCoachToTeam_B_fkey" FOREIGN KEY ("B") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ParentToPlayer" ADD CONSTRAINT "_ParentToPlayer_A_fkey" FOREIGN KEY ("A") REFERENCES "Parent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ParentToPlayer" ADD CONSTRAINT "_ParentToPlayer_B_fkey" FOREIGN KEY ("B") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;
