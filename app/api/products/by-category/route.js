import { getProductsByCategoryHandler } from "@/api/controllers/product.controller";
import { withAuth } from "@/api/middlewares/auth.middleware";
import {
  CACHE_PRESETS,
  withCacheControl,
} from "@/api/middlewares/cacheControl.middleware";
import { withErrorHandler } from "@/api/middlewares/errorHandler.middleware";
import { withLogger } from "@/api/middlewares/logger.middleware";

const handler = withCacheControl(
  withErrorHandler(
    withLogger(withAuth(getProductsByCategoryHandler, ["CASHIER", "OWNER", "OPS"]))
  ),
  CACHE_PRESETS.AUTH_READ_SHORT
);

export async function GET(req, ctx) {
  return handler(req, ctx);
}
