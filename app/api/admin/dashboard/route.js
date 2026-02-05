import { getAdminDashboard } from "@/domain/dashboard/dashboard.service";
import { withAuth } from "@/api/middlewares/auth.middleware";
import { withErrorHandler } from "@/api/middlewares/errorHandler.middleware";
import { withLogger } from "@/api/middlewares/logger.middleware";

async function handler() {
  const data = await getAdminDashboard();
  return Response.json({ data }, { status: 200 });
}

const getHandler = withErrorHandler(withLogger(withAuth(handler, ["ADMIN"])));

export async function GET(req, ctx) {
  return getHandler(req, ctx);
}
