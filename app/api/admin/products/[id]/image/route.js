import { adminUploadProductImageHandler } from "@/api/controllers/product.controller";
import { withAuth } from "@/api/middlewares/auth.middleware";
import { withErrorHandler } from "@/api/middlewares/errorHandler.middleware";
import { withLogger } from "@/api/middlewares/logger.middleware";

export const runtime = "nodejs";

const postHandler = withErrorHandler(
  withLogger(withAuth(adminUploadProductImageHandler, ["ADMIN"]))
);

export async function POST(req, ctx) {
  return postHandler(req, ctx);
}
