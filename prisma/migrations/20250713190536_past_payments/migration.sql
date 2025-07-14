-- AlterTable
ALTER TABLE "User" ALTER COLUMN "sub_next_notification" SET DEFAULT NOW() + INTERVAL '1 month' - INTERVAL '1 day';

-- CreateTable
CREATE TABLE "PastPayment" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "subscription_id" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "payment_date" TIMESTAMP(3) NOT NULL,
    "paid_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PastPayment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PastPayment_user_id_idx" ON "PastPayment"("user_id");

-- CreateIndex
CREATE INDEX "PastPayment_subscription_id_idx" ON "PastPayment"("subscription_id");

-- AddForeignKey
ALTER TABLE "PastPayment" ADD CONSTRAINT "PastPayment_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PastPayment" ADD CONSTRAINT "PastPayment_subscription_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "Subscription"("id") ON DELETE CASCADE ON UPDATE CASCADE;
