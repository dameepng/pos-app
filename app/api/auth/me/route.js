import { meHandler } from "@/api/controllers/auth.controller";
import { withErrorHandler } from "@/api/middlewares/errorHandler.middleware";
import { withLogger } from "@/api/middlewares/logger.middleware";

const handler = withErrorHandler(withLogger(meHandler));

export async function GET(req, ctx) {
  return handler(req, ctx);
}
