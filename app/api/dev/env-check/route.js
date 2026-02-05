import { env } from "@/config/env";
import { withErrorHandler } from "@/api/middlewares/errorHandler.middleware";
import { withLogger } from "@/api/middlewares/logger.middleware";

async function handler() {
  return Response.json({
    authSecretLen: (env.AUTH_JWT_SECRET || "").length,
    cookieName: env.AUTH_COOKIE_NAME,
  });
}

const getHandler = withErrorHandler(withLogger(handler));

export async function GET(req, ctx) {
  return getHandler(req, ctx);
}
