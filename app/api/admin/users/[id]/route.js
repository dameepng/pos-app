import { adminDeleteUserHandler, adminUpdateUserHandler } from "@/api/controllers/user.controller";
import { withAuth } from "@/api/middlewares/auth.middleware";
import { withErrorHandler } from "@/api/middlewares/errorHandler.middleware";
import { withLogger } from "@/api/middlewares/logger.middleware";

const handler = withErrorHandler(
  withLogger(withAuth((req, ctx, auth) => {
    if (req.method === "PATCH") return adminUpdateUserHandler(req, ctx, auth);
    if (req.method === "DELETE") return adminDeleteUserHandler(req, ctx, auth);
    return Response.json({ error: { message: "Method not allowed" } }, { status: 405 });
  }, ["OWNER"]))
);

export async function PATCH(req, ctx) {
  return handler(req, ctx);
}

export async function DELETE(req, ctx) {
  return handler(req, ctx);
}
