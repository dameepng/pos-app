import { getReceiptTemplateHandler } from "@/api/controllers/receiptTemplate.controller";
import { withAuth } from "@/api/middlewares/auth.middleware";
import { withErrorHandler } from "@/api/middlewares/errorHandler.middleware";
import { withLogger } from "@/api/middlewares/logger.middleware";

const handler = withErrorHandler(
  withLogger(withAuth(getReceiptTemplateHandler, ["CASHIER", "OWNER", "OPS"]))
);

export async function GET(req, ctx) {
  return handler(req, ctx);
}
