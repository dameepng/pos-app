-- Product list/search performance indexes
CREATE INDEX IF NOT EXISTS product_createdat_desc_idx
  ON "Product" ("createdAt" DESC);

CREATE INDEX IF NOT EXISTS product_admin_filters_idx
  ON "Product" ("isActive", "categoryId", "createdAt" DESC);

CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS product_name_trgm_idx
  ON "Product"
  USING GIN ("name" gin_trgm_ops);

CREATE INDEX IF NOT EXISTS product_sku_trgm_idx
  ON "Product"
  USING GIN ("sku" gin_trgm_ops);

CREATE INDEX IF NOT EXISTS product_barcode_trgm_idx
  ON "Product"
  USING GIN ("barcode" gin_trgm_ops);
