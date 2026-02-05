import { requireAuth, requireRole } from "@/domain/auth/auth.service";

export function withAuth(handler, roles) {
  return async function authWrapped(req, ctx) {
    const user = roles?.length ? await requireRole(roles) : await requireAuth();
    return handler(req, ctx, { user });
  };
}
