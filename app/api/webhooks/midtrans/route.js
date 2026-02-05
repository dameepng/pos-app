import { handleMidtransWebhook } from "@/domain/webhooks/midtransWebhook.service";
import { withErrorHandler } from "@/api/middlewares/errorHandler.middleware";
import { withLogger } from "@/api/middlewares/logger.middleware";

async function handler(req) {
  const body = await req.json();
  const data = await handleMidtransWebhook(body);
  return Response.json({ data }, { status: 200 });
}

const postHandler = withErrorHandler(withLogger(handler));

export async function POST(req, ctx) {
  return postHandler(req, ctx);
}
