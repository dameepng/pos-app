import { env } from "@/config/env";

export async function GET() {
  return Response.json({
    authSecretLen: (env.AUTH_JWT_SECRET || "").length,
    cookieName: env.AUTH_COOKIE_NAME,
  });
}
