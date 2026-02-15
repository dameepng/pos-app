CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS product_name_trgm_idx
  ON "Product"
  USING GIN ("name" gin_trgm_ops);

CREATE INDEX IF NOT EXISTS product_sku_trgm_idx
  ON "Product"
  USING GIN ("sku" gin_trgm_ops)
  WHERE "sku" IS NOT NULL;

CREATE INDEX IF NOT EXISTS product_barcode_trgm_idx
  ON "Product"
  USING GIN ("barcode" gin_trgm_ops)
  WHERE "barcode" IS NOT NULL;
