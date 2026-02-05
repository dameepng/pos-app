export function withLogger(handler) {
  return async function loggerWrapped(req, ctx) {
    const start = Date.now();
    const url = new URL(req.url);

    try {
      const response = await handler(req, ctx);
      const duration = Date.now() - start;
      console.log(`[API] ${req.method} ${url.pathname} ${response.status} ${duration}ms`);
      return response;
    } catch (err) {
      const duration = Date.now() - start;
      console.log(`[API] ${req.method} ${url.pathname} ERROR ${duration}ms`);
      throw err;
    }
  };
}
