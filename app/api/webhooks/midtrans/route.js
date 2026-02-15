import { handleMidtransWebhook } from "@/domain/webhooks/midtransWebhook.service";
import {
  CACHE_PRESETS,
  withCacheControl,
} from "@/api/middlewares/cacheControl.middleware";
import { withErrorHandler } from "@/api/middlewares/errorHandler.middleware";
import { withLogger } from "@/api/middlewares/logger.middleware";
import { invalidatePostSaleCaches } from "@/lib/cache/invalidation";

async function handler(req) {
  const body = await req.json();
  const data = await handleMidtransWebhook(body);

  if (
    data?.paymentStatus === "PAID" ||
    data?.idempotent === true
  ) {
    invalidatePostSaleCaches();
  }

  return Response.json({ data }, { status: 200 });
}

const postHandler = withCacheControl(
  withErrorHandler(withLogger(handler)),
  CACHE_PRESETS.NO_STORE
);

export async function POST(req, ctx) {
  return postHandler(req, ctx);
}
