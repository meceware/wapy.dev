-- CreateTable
CREATE TABLE "VerificationOTPToken" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VerificationOTPToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "VerificationOTPToken_identifier_code_idx" ON "VerificationOTPToken"("identifier", "code");

-- CreateIndex
CREATE INDEX "VerificationOTPToken_expires_idx" ON "VerificationOTPToken"("expires");
