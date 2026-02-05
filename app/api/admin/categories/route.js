import { prisma } from "@/data/prisma/client";
import { withAuth } from "@/api/middlewares/auth.middleware";
import { withErrorHandler } from "@/api/middlewares/errorHandler.middleware";
import { withLogger } from "@/api/middlewares/logger.middleware";

async function getHandlerImpl() {
  const data = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });

  return Response.json({ data }, { status: 200 });
}

async function postHandlerImpl(req) {
  const body = await req.json();
  const name = (body?.name || "").trim();
  if (!name) return Response.json({ error: { message: "name is required" } }, { status: 400 });

  const data = await prisma.category.create({ data: { name } });
  return Response.json({ data }, { status: 201 });
}

const getHandler = withErrorHandler(withLogger(withAuth(getHandlerImpl, ["CASHIER", "ADMIN"])));
const postHandler = withErrorHandler(withLogger(withAuth(postHandlerImpl, ["ADMIN"])));

export async function GET(req, ctx) {
  return getHandler(req, ctx);
}

export async function POST(req, ctx) {
  return postHandler(req, ctx);
}
