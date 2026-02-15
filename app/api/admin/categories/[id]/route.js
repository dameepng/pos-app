import { prisma } from "@/data/prisma/client";
import { withAuth } from "@/api/middlewares/auth.middleware";
import { withErrorHandler } from "@/api/middlewares/errorHandler.middleware";
import { withLogger } from "@/api/middlewares/logger.middleware";
import { invalidateCategoryCaches } from "@/lib/cache/invalidation";

async function putHandlerImpl(req, { params }) {
  const { id } = await params;
  const body = await req.json();
  const name = (body?.name || "").trim();
  if (!name) return Response.json({ error: { message: "name is required" } }, { status: 400 });

  const data = await prisma.category.update({
    where: { id },
    data: { name },
  });
  invalidateCategoryCaches();

  return Response.json({ data }, { status: 200 });
}

async function deleteHandlerImpl(req, { params }) {
  const { id } = await params;

  await prisma.category.delete({ where: { id } });
  invalidateCategoryCaches();

  return Response.json({ data: { ok: true } }, { status: 200 });
}

const putHandler = withErrorHandler(
  withLogger(withAuth(putHandlerImpl, ["OWNER", "OPS"]))
);
const deleteHandler = withErrorHandler(
  withLogger(withAuth(deleteHandlerImpl, ["OWNER", "OPS"]))
);

export async function PUT(req, ctx) {
  return putHandler(req, ctx);
}

export async function DELETE(req, ctx) {
  return deleteHandler(req, ctx);
}
