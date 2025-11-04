/*
  Warnings:

  - You are about to drop the column `webhook` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "webhook",
ALTER COLUMN "sub_next_notification" SET DEFAULT NOW() + INTERVAL '1 month' - INTERVAL '1 day';
