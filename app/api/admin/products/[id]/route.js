import {
  adminDeleteProductHandler,
  adminGetProductHandler,
  adminPatchProductHandler,
  adminUpdateProductHandler,
} from "@/api/controllers/product.controller";
import { withAuth } from "@/api/middlewares/auth.middleware";
import { withErrorHandler } from "@/api/middlewares/errorHandler.middleware";
import { withLogger } from "@/api/middlewares/logger.middleware";

const getHandler = withErrorHandler(
  withLogger(withAuth(adminGetProductHandler, ["ADMIN"]))
);
const putHandler = withErrorHandler(
  withLogger(withAuth(adminUpdateProductHandler, ["ADMIN"]))
);
const patchHandler = withErrorHandler(
  withLogger(withAuth(adminPatchProductHandler, ["ADMIN"]))
);
const deleteHandler = withErrorHandler(
  withLogger(withAuth(adminDeleteProductHandler, ["ADMIN"]))
);

export async function GET(req, ctx) {
  return getHandler(req, ctx);
}

export async function PUT(req, ctx) {
  return putHandler(req, ctx);
}

export async function PATCH(req, ctx) {
  return patchHandler(req, ctx);
}

export async function DELETE(req, ctx) {
  return deleteHandler(req, ctx);
}
