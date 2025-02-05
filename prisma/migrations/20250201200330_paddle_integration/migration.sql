-- AlterTable
ALTER TABLE "User" ADD COLUMN     "full_access" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "is_blocked" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "sub_next_notification" TIMESTAMP(3) DEFAULT NOW() + INTERVAL '1 month' - INTERVAL '1 day',
ADD COLUMN     "trial_started_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "PaddleUserDetails" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "marketing_consent" BOOLEAN NOT NULL DEFAULT false,
    "customer_status" TEXT NOT NULL DEFAULT 'none',
    "subscription_id" TEXT NOT NULL DEFAULT '',
    "subscription_status" TEXT NOT NULL DEFAULT 'none',
    "subscription_started_at" TIMESTAMP(3),
    "subscription_next_payment_at" TIMESTAMP(3),
    "subscription_scheduled_change" JSONB DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaddleUserDetails_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PaddleUserDetails_user_id_customer_id_idx" ON "PaddleUserDetails"("user_id", "customer_id");

-- CreateIndex
CREATE UNIQUE INDEX "PaddleUserDetails_customer_id_key" ON "PaddleUserDetails"("customer_id");

-- CreateIndex
CREATE UNIQUE INDEX "PaddleUserDetails_user_id_key" ON "PaddleUserDetails"("user_id");

-- AddForeignKey
ALTER TABLE "PaddleUserDetails" ADD CONSTRAINT "PaddleUserDetails_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
