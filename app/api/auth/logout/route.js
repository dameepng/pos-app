import { logoutHandler } from "@/api/controllers/auth.controller";
import { withErrorHandler } from "@/api/middlewares/errorHandler.middleware";
import { withLogger } from "@/api/middlewares/logger.middleware";

const handler = withErrorHandler(withLogger(logoutHandler));

export async function POST(req, ctx) {
  return handler(req, ctx);
}
