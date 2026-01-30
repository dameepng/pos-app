import { SignJWT, jwtVerify } from "jose";
import { env } from "@/config/env";

function getKey() {
  const secret = env.AUTH_JWT_SECRET;
  if (!secret || secret.trim().length < 10) {
    throw new Error("AUTH_JWT_SECRET is missing/too short. Set it in .env.local");
  }
  return new TextEncoder().encode(secret);
}

export async function signSession(payload, expiresIn = "7d") {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(getKey());
}

export async function verifySession(token) {
  const { payload } = await jwtVerify(token, getKey());
  return payload;
}
