import { toHttpResponse } from "@/lib/errors/toHttpResponse";

export function withErrorHandler(handler) {
  return async function errorWrapped(req, ctx) {
    try {
      return await handler(req, ctx);
    } catch (err) {
      return toHttpResponse(err);
    }
  };
}
