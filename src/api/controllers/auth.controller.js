import {
  changeOwnPassword,
  getAuthUserFromRequest,
  loginWithEmailPassword,
} from "@/domain/auth/auth.service";
import {
  validateChangePasswordBody,
  validateLoginBody,
} from "@/api/validators/auth.validator";
import { clearSessionCookie, setSessionCookie } from "@/lib/auth/cookies";
import { toHttpResponse } from "@/lib/errors/toHttpResponse";

export async function loginHandler(req) {
  try {
    const body = await req.json();
    const validation = validateLoginBody(body);

    if (validation.error) {
      return Response.json(
        { error: { message: validation.error.message } },
        { status: validation.error.status }
      );
    }

    const { token, user } = await loginWithEmailPassword(validation.value);

    await setSessionCookie(token);

    return Response.json({ data: user }, { status: 200 });
  } catch (err) {
    return toHttpResponse(err);
  }
}

export async function logoutHandler() {
  await clearSessionCookie();
  return Response.json({ data: { ok: true } }, { status: 200 });
}

export async function meHandler() {
  try {
    const user = await getAuthUserFromRequest();
    return Response.json({ data: user }, { status: 200 });
  } catch (err) {
    return toHttpResponse(err);
  }
}

export async function changePasswordHandler(req, _ctx, auth) {
  try {
    const userId = auth?.user?.id;
    if (!userId) {
      return Response.json({ error: { message: "Unauthorized" } }, { status: 401 });
    }

    const body = await req.json();
    const validation = validateChangePasswordBody(body);

    if (validation.error) {
      return Response.json(
        { error: { message: validation.error.message } },
        { status: validation.error.status }
      );
    }

    const data = await changeOwnPassword({
      userId,
      currentPassword: validation.value.currentPassword,
      newPassword: validation.value.newPassword,
    });

    return Response.json({ data }, { status: 200 });
  } catch (err) {
    return toHttpResponse(err);
  }
}
