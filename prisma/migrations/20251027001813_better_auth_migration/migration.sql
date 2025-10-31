/*
  Warnings:

  - The primary key for the `Account` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the `Authenticator` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `VerificationOTPToken` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `VerificationToken` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[provider,provider_account_id]` on the table `Account` will be added. If there are existing duplicate values, this will fail.
  - The required column `id` was added to the `Account` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- DropForeignKey
ALTER TABLE "public"."Authenticator" DROP CONSTRAINT "Authenticator_user_id_fkey";

-- AlterTable
ALTER TABLE "Account" DROP CONSTRAINT "Account_pkey",
ADD COLUMN     "id" TEXT;
UPDATE "Account" SET "id" = gen_random_uuid()::text;
ALTER TABLE "Account" ALTER COLUMN "id" SET NOT NULL;
ALTER TABLE "Account" ADD CONSTRAINT "Account_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "sub_next_notification" SET DEFAULT NOW() + INTERVAL '1 month' - INTERVAL '1 day';

-- DropTable
DROP TABLE "public"."Authenticator";

-- DropTable
DROP TABLE "public"."VerificationOTPToken";

-- DropTable
DROP TABLE "public"."VerificationToken";

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_provider_account_id_key" ON "Account"("provider", "provider_account_id");
