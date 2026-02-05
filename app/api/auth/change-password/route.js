import { changePasswordHandler } from "@/api/controllers/auth.controller";
import { withAuth } from "@/api/middlewares/auth.middleware";
import { withErrorHandler } from "@/api/middlewares/errorHandler.middleware";
import { withLogger } from "@/api/middlewares/logger.middleware";

const handler = withErrorHandler(withLogger(withAuth(changePasswordHandler)));

export async function POST(req, ctx) {
  return handler(req, ctx);
}
