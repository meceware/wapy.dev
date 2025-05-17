-- AlterTable
ALTER TABLE "User" ADD COLUMN     "webhook" TEXT NOT NULL DEFAULT '',
ALTER COLUMN "sub_next_notification" SET DEFAULT NOW() + INTERVAL '1 month' - INTERVAL '1 day';
