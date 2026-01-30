import { cookies } from "next/headers";
import { env } from "@/config/env";

export async function setSessionCookie(token) {
  const jar = await cookies();
  jar.set(env.AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export async function clearSessionCookie() {
  const jar = await cookies();
  jar.set(env.AUTH_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

export async function getSessionToken() {
  const jar = await cookies();
  return jar.get(env.AUTH_COOKIE_NAME)?.value || null;
}
