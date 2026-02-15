import { createSaleHandler } from "@/api/controllers/sale.controller";
import { withAuth } from "@/api/middlewares/auth.middleware";
import {
  CACHE_PRESETS,
  withCacheControl,
} from "@/api/middlewares/cacheControl.middleware";
import { withErrorHandler } from "@/api/middlewares/errorHandler.middleware";
import { withLogger } from "@/api/middlewares/logger.middleware";

const handler = withCacheControl(
  withErrorHandler(
    withLogger(withAuth(createSaleHandler, ["CASHIER", "OWNER", "OPS"]))
  ),
  CACHE_PRESETS.NO_STORE
);

export async function POST(req, ctx) {
  return handler(req, ctx);
}
