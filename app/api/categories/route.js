import { withAuth } from "@/api/middlewares/auth.middleware";
import {
  CACHE_PRESETS,
  withCacheControl,
} from "@/api/middlewares/cacheControl.middleware";
import { withErrorHandler } from "@/api/middlewares/errorHandler.middleware";
import { withLogger } from "@/api/middlewares/logger.middleware";
import { listAdminCategories } from "@/domain/products/adminProducts.service";

async function handler() {
  const data = await listAdminCategories();

  return Response.json({ data }, { status: 200 });
}

const getHandler = withCacheControl(
  withErrorHandler(
    withLogger(withAuth(handler, ["CASHIER", "OWNER", "OPS"]))
  ),
  CACHE_PRESETS.AUTH_READ_MEDIUM
);

export async function GET(req, ctx) {
  return getHandler(req, ctx);
}
