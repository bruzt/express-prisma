-- AlterTable
ALTER TABLE "Order" ALTER COLUMN "payment_method" DROP NOT NULL,
ALTER COLUMN "status" SET DEFAULT E'select_payment_method';
