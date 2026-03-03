-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM (
    'PLACED',
    'CONFIRMED',
    'PACKING',
    'OUT_FOR_DELIVERY',
    'DELIVERED',
    'CANCELLED'
);

-- CreateTable
CREATE TABLE "Shop" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "addressLine" TEXT NOT NULL,
    "isOpen" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Shop_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "shopId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT,
    "unit" TEXT,
    "imageUrl" TEXT,
    "inStock" BOOLEAN NOT NULL DEFAULT true,
    "shopPricePaise" INTEGER NOT NULL,
    "appPricePaise" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "shopId" TEXT NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'PLACED',
    "customerName" TEXT NOT NULL,
    "customerPhone" TEXT NOT NULL,
    "deliveryLine1" TEXT NOT NULL,
    "deliveryLine2" TEXT,
    "landmark" TEXT,
    "area" TEXT,
    "notes" TEXT,
    "paymentMode" TEXT NOT NULL DEFAULT 'COD',
    "deliveryFeePaise" INTEGER NOT NULL DEFAULT 1000,
    "subtotalAppPaise" INTEGER NOT NULL,
    "totalAppPaise" INTEGER NOT NULL,
    "subtotalShopPaise" INTEGER NOT NULL,
    "marginPaise" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderItem" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "qty" INTEGER NOT NULL DEFAULT 1,
    "appPricePaise" INTEGER NOT NULL,
    "shopPricePaise" INTEGER NOT NULL,
    "lineAppTotalPaise" INTEGER NOT NULL,
    "lineShopTotalPaise" INTEGER NOT NULL,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Product"
ADD CONSTRAINT "Product_shopId_fkey" FOREIGN KEY ("shopId")
REFERENCES "Shop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order"
ADD CONSTRAINT "Order_shopId_fkey" FOREIGN KEY ("shopId")
REFERENCES "Shop"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem"
ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId")
REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem"
ADD CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId")
REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
