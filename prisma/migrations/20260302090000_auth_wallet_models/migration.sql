-- CreateEnum
CREATE TYPE "WalletTransactionType" AS ENUM (
    'TOPUP',
    'ORDER_DEBIT',
    'UPI_CREDIT'
);

-- CreateEnum
CREATE TYPE "WalletTopupRequestStatus" AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED'
);

-- CreateEnum
CREATE TYPE "WalletUpiCreditStatus" AS ENUM (
    'OPEN',
    'CLAIMED'
);

-- CreateTable
CREATE TABLE "customer_accounts" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "default_delivery_line1" TEXT,
    "default_delivery_line2" TEXT,
    "default_landmark" TEXT,
    "default_area" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "customer_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wallet_accounts" (
    "username" TEXT NOT NULL,
    "balance_paise" INTEGER NOT NULL DEFAULT 0,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wallet_accounts_pkey" PRIMARY KEY ("username")
);

-- CreateTable
CREATE TABLE "wallet_transactions" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "type" "WalletTransactionType" NOT NULL,
    "amount_paise" INTEGER NOT NULL,
    "balance_after_paise" INTEGER NOT NULL,
    "note" TEXT,
    "ref_order_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wallet_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wallet_topup_requests" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "amount_paise" INTEGER NOT NULL,
    "upi_ref" TEXT NOT NULL,
    "status" "WalletTopupRequestStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wallet_topup_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wallet_upi_credits" (
    "id" TEXT NOT NULL,
    "transaction_id" TEXT NOT NULL,
    "amount_paise" INTEGER NOT NULL,
    "status" "WalletUpiCreditStatus" NOT NULL DEFAULT 'OPEN',
    "created_by_admin" TEXT,
    "claimed_by_username" TEXT,
    "claimed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wallet_upi_credits_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "customer_accounts_username_key"
ON "customer_accounts"("username");

-- CreateIndex
CREATE INDEX "idx_wallet_txn_username_created"
ON "wallet_transactions"("username", "created_at");

-- CreateIndex
CREATE INDEX "idx_wallet_txn_type_ref_order"
ON "wallet_transactions"("type", "ref_order_id");

-- CreateIndex
CREATE UNIQUE INDEX "uq_wallet_txn_username_type_ref_order"
ON "wallet_transactions"("username", "type", "ref_order_id");

-- CreateIndex
CREATE INDEX "idx_wallet_topup_req_username_created"
ON "wallet_topup_requests"("username", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "wallet_upi_credits_transaction_id_key"
ON "wallet_upi_credits"("transaction_id");

-- CreateIndex
CREATE INDEX "idx_wallet_upi_credits_created"
ON "wallet_upi_credits"("created_at");

-- AddForeignKey
ALTER TABLE "wallet_transactions"
ADD CONSTRAINT "wallet_transactions_username_fkey" FOREIGN KEY ("username")
REFERENCES "wallet_accounts"("username") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wallet_topup_requests"
ADD CONSTRAINT "wallet_topup_requests_username_fkey" FOREIGN KEY ("username")
REFERENCES "wallet_accounts"("username") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wallet_upi_credits"
ADD CONSTRAINT "wallet_upi_credits_claimed_by_username_fkey" FOREIGN KEY ("claimed_by_username")
REFERENCES "wallet_accounts"("username") ON DELETE SET NULL ON UPDATE CASCADE;
