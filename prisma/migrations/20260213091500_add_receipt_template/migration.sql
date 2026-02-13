CREATE TABLE "ReceiptTemplate" (
  "id" TEXT NOT NULL,
  "storeName" TEXT,
  "storeAddress" TEXT,
  "storePhone" TEXT,
  "footerText" TEXT,
  "logoUrl" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "ReceiptTemplate_pkey" PRIMARY KEY ("id")
);
