import bcrypt from "bcryptjs";
import { findUserByEmail } from "@/data/repositories/user.repo";
import { AppError } from "@/lib/errors/AppError";
import { ERROR_CODES } from "@/lib/errors/errorCodes";
import { signSession, verifySession } from "@/lib/auth/jwt";
import { getSessionToken } from "@/lib/auth/cookies";

export async function loginWithEmailPassword({ email, password }) {
  const user = await findUserByEmail(email);
  if (!user) {
    throw new AppError(ERROR_CODES.UNAUTHORIZED, "Email/password salah", 401);
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    throw new AppError(ERROR_CODES.UNAUTHORIZED, "Email/password salah", 401);
  }

  const token = await signSession({
    sub: user.id,
    email: user.email,
    role: user.role,
    branchId: user.branchId,
  });

  return { token, user: { id: user.id, email: user.email, role: user.role, branchId: user.branchId } };
}

export async function getAuthUserFromRequest() {
  const token = await getSessionToken();
  if (!token) return null;

  try {
    const payload = await verifySession(token);
    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      branchId: payload.branchId,
    };
  } catch {
    return null;
  }
}

export async function requireAuth() {
  const user = await getAuthUserFromRequest();
  if (!user) throw new AppError(ERROR_CODES.UNAUTHORIZED, "Unauthorized", 401);
  return user;
}

export async function requireRole(allowedRoles) {
  const user = await requireAuth();
  if (!allowedRoles.includes(user.role)) {
    throw new AppError(ERROR_CODES.FORBIDDEN, "Forbidden", 403);
  }
  return user;
}
