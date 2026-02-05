import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const COOKIE_NAME = process.env.AUTH_COOKIE_NAME || "pos_session";
const PUBLIC_API_PATHS = new Set([
  "/api/auth/login",
  "/api/auth/logout",
  "/api/auth/me",
  "/api/webhooks/midtrans",
  "/api/dev/env-check",
  "/api/dev/simulate-midtrans",
]);

function getKey() {
  return new TextEncoder().encode(process.env.AUTH_JWT_SECRET);
}

async function verifyToken(token) {
  const { payload } = await jwtVerify(token, getKey());
  return payload;
}

// ✅ Ganti "middleware" menjadi "proxy"
export async function proxy(req) {
  const { pathname } = req.nextUrl;

  // 1. Public routes (no auth required)
  if (pathname.startsWith("/login")) {
    return NextResponse.next();
  }

  if (PUBLIC_API_PATHS.has(pathname)) {
    return NextResponse.next();
  }

  // 2. Protect API routes with lightweight token presence check
  if (pathname.startsWith("/api")) {
    const token = req.cookies.get(COOKIE_NAME)?.value;
    if (!token) {
      return NextResponse.json({ error: { message: "Unauthorized" } }, { status: 401 });
    }
    return NextResponse.next();
  }

  // 3. Protect POS + Admin routes only
  const isPosRoute = pathname.startsWith("/pos");
  const isAdminRoute = pathname.startsWith("/admin");
  const isSalesRoute = pathname.startsWith("/sales");

  if (!isPosRoute && !isAdminRoute && !isSalesRoute) {
    return NextResponse.next();
  }

  // 4. Get session token from cookie
  const token = req.cookies.get(COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // 5. Verify JWT
  let user;
  try {
    user = await verifyToken(token);
  } catch (err) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const role = user.role;

  // 6. RBAC Rules
  if (isAdminRoute && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/pos", req.url));
  }

  if ((isPosRoute || isSalesRoute) && role !== "CASHIER" && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*", "/pos/:path*", "/admin/:path*", "/sales/:path*"],
};
