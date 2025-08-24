-- AlterTable
ALTER TABLE "public"."User" ALTER COLUMN "sub_next_notification" SET DEFAULT NOW() + INTERVAL '1 month' - INTERVAL '1 day';

-- CreateTable
CREATE TABLE "public"."PaymentMethod" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "icon" TEXT DEFAULT '',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentMethod_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."_PaymentMethodToSubscription" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_PaymentMethodToSubscription_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "PaymentMethod_user_id_idx" ON "public"."PaymentMethod"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentMethod_name_user_id_key" ON "public"."PaymentMethod"("name", "user_id");

-- CreateIndex
CREATE INDEX "_PaymentMethodToSubscription_B_index" ON "public"."_PaymentMethodToSubscription"("B");

-- AddForeignKey
ALTER TABLE "public"."PaymentMethod" ADD CONSTRAINT "PaymentMethod_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_PaymentMethodToSubscription" ADD CONSTRAINT "_PaymentMethodToSubscription_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."PaymentMethod"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_PaymentMethodToSubscription" ADD CONSTRAINT "_PaymentMethodToSubscription_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."Subscription"("id") ON DELETE CASCADE ON UPDATE CASCADE;
