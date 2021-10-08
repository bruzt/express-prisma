-- CreateTable
CREATE TABLE "Order" (
    "id" SERIAL NOT NULL,
    "freight_name" TEXT NOT NULL,
    "freight_price" DECIMAL(65,30) NOT NULL,
    "total_price" DECIMAL(65,30) NOT NULL,
    "payment_method" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT E'waiting_payment',
    "boleto_url" TEXT,
    "tracking_code" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "user_id" INTEGER NOT NULL,
    "address_id" INTEGER,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);
