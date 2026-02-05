import {
  adminCreateProductHandler,
  adminListProductsHandler,
} from "@/api/controllers/product.controller";
import { withAuth } from "@/api/middlewares/auth.middleware";
import { withErrorHandler } from "@/api/middlewares/errorHandler.middleware";
import { withLogger } from "@/api/middlewares/logger.middleware";

const getHandler = withErrorHandler(
  withLogger(withAuth(adminListProductsHandler, ["ADMIN"]))
);
const postHandler = withErrorHandler(
  withLogger(withAuth(adminCreateProductHandler, ["ADMIN"]))
);

export async function GET(req, ctx) {
  return getHandler(req, ctx);
}

export async function POST(req, ctx) {
  return postHandler(req, ctx);
}
