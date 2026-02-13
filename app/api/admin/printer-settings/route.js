import {
  getReceiptTemplateHandler,
  updateReceiptTemplateHandler,
} from "@/api/controllers/receiptTemplate.controller";
import { withAuth } from "@/api/middlewares/auth.middleware";
import { withErrorHandler } from "@/api/middlewares/errorHandler.middleware";
import { withLogger } from "@/api/middlewares/logger.middleware";

const getHandler = withErrorHandler(
  withLogger(withAuth(getReceiptTemplateHandler, ["OWNER"]))
);

const putHandler = withErrorHandler(
  withLogger(withAuth(updateReceiptTemplateHandler, ["OWNER"]))
);

export async function GET(req, ctx) {
  return getHandler(req, ctx);
}

export async function PUT(req, ctx) {
  return putHandler(req, ctx);
}
