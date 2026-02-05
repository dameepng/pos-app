import { prisma } from "@/data/prisma/client";
import { withAuth } from "@/api/middlewares/auth.middleware";
import { withErrorHandler } from "@/api/middlewares/errorHandler.middleware";
import { withLogger } from "@/api/middlewares/logger.middleware";

async function handler() {
  const data = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });

  return Response.json({ data }, { status: 200 });
}

const getHandler = withErrorHandler(
  withLogger(withAuth(handler, ["CASHIER", "ADMIN"]))
);

export async function GET(req, ctx) {
  return getHandler(req, ctx);
}
