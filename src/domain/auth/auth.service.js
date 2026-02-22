import { cache } from "react";
import bcrypt from "bcryptjs";
import {
  createUser,
  findAuthUserByEmail,
  findUserByEmail,
  findUserById,
  updateUserById,
} from "@/data/repositories/user.repo";
import { AppError } from "@/lib/errors/AppError";
import { ERROR_CODES } from "@/lib/errors/errorCodes";
import { signSession, verifySession } from "@/lib/auth/jwt";
import { getSessionToken } from "@/lib/auth/cookies";

const AUTH_LOGIN_USER_CACHE_TTL_MS = Number(
  process.env.AUTH_LOGIN_USER_CACHE_TTL_MS || 60000
);
const authLoginUserCache = new Map();

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function getCachedLoginUser(email) {
  const hit = authLoginUserCache.get(email);
  if (!hit) return null;
  if (Date.now() >= hit.expiresAt) {
    authLoginUserCache.delete(email);
    return null;
  }
  return hit.value;
}

function setCachedLoginUser(email, user) {
  authLoginUserCache.set(email, {
    value: user,
    expiresAt: Date.now() + AUTH_LOGIN_USER_CACHE_TTL_MS,
  });
}

function invalidateCachedLoginUser(email) {
  authLoginUserCache.delete(normalizeEmail(email));
}

function clearCachedLoginUsers() {
  authLoginUserCache.clear();
}

export async function loginWithEmailPassword({ email, password }) {
  const normalizedEmail = normalizeEmail(email);
  let user = getCachedLoginUser(normalizedEmail);
  if (!user) {
    user = await findAuthUserByEmail(normalizedEmail);
    if (user) {
      setCachedLoginUser(normalizedEmail, user);
    }
  }

  if (!user) {
    throw new AppError(ERROR_CODES.UNAUTHORIZED, "Email/password salah", 401);
  }
  if (!user.passwordHash) {
    throw new AppError(ERROR_CODES.UNAUTHORIZED, "Email/password salah", 401);
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    throw new AppError(ERROR_CODES.UNAUTHORIZED, "Email/password salah", 401);
  }

  const token = await signSession({
    sub: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    branchId: user.branchId,
  });

  return { token, user: { id: user.id, name: user.name, email: user.email, role: user.role, branchId: user.branchId } };
}

export const getAuthUserFromRequest = cache(async function getAuthUserFromRequest() {
  const token = await getSessionToken();
  if (!token) return null;

  try {
    const payload = await verifySession(token);
    return {
      id: payload.sub,
      name: payload.name || null,
      email: payload.email,
      role: payload.role,
      branchId: payload.branchId,
    };
  } catch {
    return null;
  }
});

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

export async function changeOwnPassword({ userId, currentPassword, newPassword }) {
  const user = await findUserById(userId);
  if (!user || !user.passwordHash) {
    throw new AppError(ERROR_CODES.UNAUTHORIZED, "Unauthorized", 401);
  }

  const ok = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!ok) {
    throw new AppError(ERROR_CODES.UNAUTHORIZED, "Current password is incorrect", 401);
  }

  const newHash = await bcrypt.hash(newPassword, 10);
  await updateUserById(userId, {
    passwordHash: newHash,
    mustChangePassword: false,
  });
  invalidateCachedLoginUser(user.email);

  return { ok: true };
}

export async function adminUpdateUser({ userId, email, role, password }) {
  const data = {};

  if (typeof email === "string") {
    data.email = email.trim();
  }

  if (typeof role === "string") {
    data.role = role;
  }

  if (typeof password === "string" && password.length > 0) {
    const newHash = await bcrypt.hash(password, 10);
    data.passwordHash = newHash;
    data.mustChangePassword = true;
  }

  if (Object.keys(data).length === 0) {
    throw new AppError(ERROR_CODES.VALIDATION_ERROR, "No fields to update", 400);
  }

  const updated = await updateUserById(userId, data);
  clearCachedLoginUsers();
  return { id: updated.id, email: updated.email, role: updated.role };
}

export async function adminCreateUser({ name, email, role, password }) {
  const normalizedEmail = String(email || "").trim().toLowerCase();
  const normalizedName = String(name || "").trim();

  const existing = await findUserByEmail(normalizedEmail);
  if (existing) {
    throw new AppError(ERROR_CODES.CONFLICT, "Email already exists", 409);
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const created = await createUser({
    name: normalizedName,
    email: normalizedEmail,
    role,
    passwordHash,
    mustChangePassword: true,
  });

  invalidateCachedLoginUser(created.email);

  return {
    id: created.id,
    name: created.name,
    email: created.email,
    role: created.role,
    mustChangePassword: created.mustChangePassword,
  };
}
