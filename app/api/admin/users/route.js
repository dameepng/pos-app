import {
  adminCreateUserHandler,
  adminListUsersHandler,
} from "@/api/controllers/user.controller";
import { withAuth } from "@/api/middlewares/auth.middleware";
import { withErrorHandler } from "@/api/middlewares/errorHandler.middleware";
import { withLogger } from "@/api/middlewares/logger.middleware";

const listHandler = withErrorHandler(
  withLogger(withAuth(adminListUsersHandler, ["OWNER"]))
);
const createHandler = withErrorHandler(
  withLogger(withAuth(adminCreateUserHandler, ["OWNER"]))
);

export async function GET(req, ctx) {
  return listHandler(req, ctx);
}

export async function POST(req, ctx) {
  return createHandler(req, ctx);
}
