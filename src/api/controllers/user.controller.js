import { adminCreateUser, adminDeleteUser, adminUpdateUser } from "@/domain/auth/auth.service";
import {
  validateAdminCreateUserBody,
  validateAdminUpdateUserBody,
} from "@/api/validators/user.validator";
import { toHttpResponse } from "@/lib/errors/toHttpResponse";
import { listUsers } from "@/data/repositories/user.repo";

export async function adminUpdateUserHandler(req, { params }, auth) {
  try {
    const { id } = await params;
    const actorId = auth?.user?.id;
    const body = await req.json();
    const validation = validateAdminUpdateUserBody(body);

    if (validation.error) {
      return Response.json(
        { error: { message: validation.error.message } },
        { status: validation.error.status }
      );
    }

    if (actorId && actorId === id && validation.value.password) {
      return Response.json(
        { error: { message: "Use change-password with current password" } },
        { status: 400 }
      );
    }

    const data = await adminUpdateUser({
      userId: id,
      email: validation.value.email,
      role: validation.value.role,
      password: validation.value.password,
    });

    return Response.json({ data }, { status: 200 });
  } catch (err) {
    return toHttpResponse(err);
  }
}

export async function adminListUsersHandler(req) {
  try {
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") || "").trim();
    const take = Math.min(Number(searchParams.get("take") || 20), 50);
    const skip = Math.max(Number(searchParams.get("skip") || 0), 0);

    const data = await listUsers({ q, take, skip });

    return Response.json({ data }, { status: 200 });
  } catch (err) {
    return toHttpResponse(err);
  }
}

export async function adminCreateUserHandler(req) {
  try {
    const body = await req.json();
    const validation = validateAdminCreateUserBody(body);
    if (validation.error) {
      return Response.json(
        { error: { message: validation.error.message } },
        { status: validation.error.status }
      );
    }

    const data = await adminCreateUser({
      name: validation.value.name,
      email: validation.value.email,
      role: validation.value.role,
      password: validation.value.password,
    });

    return Response.json({ data }, { status: 201 });
  } catch (err) {
    return toHttpResponse(err);
  }
}

export async function adminDeleteUserHandler(req, { params }, auth) {
  try {
    const { id } = await params;
    const actorId = auth?.user?.id;

    if (actorId && actorId === id) {
      return Response.json(
        { error: { message: "You cannot delete yourself" } },
        { status: 400 }
      );
    }

    await adminDeleteUser(id);
    return Response.json({ ok: true }, { status: 200 });
  } catch (err) {
    return toHttpResponse(err);
  }
}
