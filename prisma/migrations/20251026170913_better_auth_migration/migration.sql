/*
  Warnings:

  - You are about to drop the column `session_state` on the `Account` table. All the data in the column will be lost.
  - You are about to drop the column `token_type` on the `Account` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Account` table. All the data in the column will be lost.
  - The `expires_at` column on the `Account` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The required column `id` was added to the `Session` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `email_verified` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Account" DROP COLUMN "session_state",
DROP COLUMN "token_type",
DROP COLUMN "type",
ADD COLUMN  "refresh_token_expires_at" TIMESTAMP(3),
DROP COLUMN "expires_at",
ADD COLUMN  "expires_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Session" ADD COLUMN     "id" TEXT;
UPDATE "Session" SET "id" = gen_random_uuid()::text;
ALTER TABLE "Session" ALTER COLUMN "id" SET NOT NULL;
ALTER TABLE "Session" ADD COLUMN     "ip_address" TEXT,
ADD COLUMN     "user_agent" TEXT,
ADD CONSTRAINT "Session_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "User" ADD COLUMN "email_verified_new" BOOLEAN;
UPDATE "User" SET "email_verified_new" = CASE
  WHEN "email_verified" IS NOT NULL THEN true
  ELSE false
END;

ALTER TABLE "User" DROP COLUMN "email_verified";
ALTER TABLE "User" RENAME COLUMN "email_verified_new" TO "email_verified";
ALTER TABLE "User" ALTER COLUMN "sub_next_notification" SET DEFAULT NOW() + INTERVAL '1 month' - INTERVAL '1 day',
ALTER COLUMN "email_verified" SET NOT NULL;

-- CreateTable
CREATE TABLE "Verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Verification_pkey" PRIMARY KEY ("id")
);
