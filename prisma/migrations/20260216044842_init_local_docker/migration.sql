-- DropIndex
DROP INDEX "payment_saleid_createdat_idx";

-- DropIndex
DROP INDEX "product_admin_filters_idx";

-- DropIndex
DROP INDEX "product_barcode_trgm_idx";

-- DropIndex
DROP INDEX "product_createdat_desc_idx";

-- DropIndex
DROP INDEX "product_name_trgm_idx";

-- DropIndex
DROP INDEX "product_sku_trgm_idx";

-- CreateIndex
CREATE INDEX "Inventory_qtyOnHand_idx" ON "Inventory"("qtyOnHand");

-- CreateIndex
CREATE INDEX "Payment_saleId_createdAt_idx" ON "Payment"("saleId", "createdAt");

-- CreateIndex
CREATE INDEX "Product_createdAt_idx" ON "Product"("createdAt");

-- CreateIndex
CREATE INDEX "Product_isActive_categoryId_createdAt_idx" ON "Product"("isActive", "categoryId", "createdAt");

-- CreateIndex
CREATE INDEX "Sale_createdAt_idx" ON "Sale"("createdAt");

-- RenameIndex
ALTER INDEX "saleitem_saleid_productid_idx" RENAME TO "SaleItem_saleId_productId_idx";
