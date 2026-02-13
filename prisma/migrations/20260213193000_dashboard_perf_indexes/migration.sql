-- Dashboard performance indexes
CREATE INDEX IF NOT EXISTS sale_dashboard_active_createdat_idx
  ON "Sale" ("createdAt" DESC)
  WHERE "status" IN ('PENDING', 'PAID');

CREATE INDEX IF NOT EXISTS inventory_low_stock_idx
  ON "Inventory" ("qtyOnHand" ASC)
  WHERE "qtyOnHand" <= 10;

CREATE INDEX IF NOT EXISTS saleitem_saleid_productid_idx
  ON "SaleItem" ("saleId", "productId");

CREATE INDEX IF NOT EXISTS payment_saleid_createdat_idx
  ON "Payment" ("saleId", "createdAt" DESC);
