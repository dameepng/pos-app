import { getReceiptTemplateHandler } from "@/api/controllers/receiptTemplate.controller";
import { withAuth } from "@/api/middlewares/auth.middleware";
import {
  CACHE_PRESETS,
  withCacheControl,
} from "@/api/middlewares/cacheControl.middleware";
import { withErrorHandler } from "@/api/middlewares/errorHandler.middleware";
import { withLogger } from "@/api/middlewares/logger.middleware";

const handler = withCacheControl(
  withErrorHandler(
    withLogger(withAuth(getReceiptTemplateHandler, ["CASHIER", "OWNER", "OPS"]))
  ),
  CACHE_PRESETS.AUTH_READ_MEDIUM
);

export async function GET(req, ctx) {
  return handler(req, ctx);
}
