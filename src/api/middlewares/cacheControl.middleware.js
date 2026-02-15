export const CACHE_PRESETS = {
  AUTH_READ_SHORT: {
    "Cache-Control": "public, s-maxage=10, stale-while-revalidate=50",
    Vary: "Cookie",
  },
  AUTH_READ_MEDIUM: {
    "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
    Vary: "Cookie",
  },
  NO_STORE: {
    "Cache-Control": "no-store, max-age=0",
    Pragma: "no-cache",
  },
};

export function withCacheControl(handler, headers) {
  return async function cacheControlWrapped(req, ctx) {
    const response = await handler(req, ctx);

    if (!(response instanceof Response)) {
      return response;
    }

    for (const [key, value] of Object.entries(headers || {})) {
      response.headers.set(key, value);
    }

    return response;
  };
}
