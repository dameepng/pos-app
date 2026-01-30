import { toHttpResponse } from "@/lib/errors/toHttpResponse";
import { loginWithEmailPassword } from "@/domain/auth/auth.service";
import { setSessionCookie } from "@/lib/auth/cookies";

export async function POST(req) {
  try {
    const body = await req.json();
    const { token, user } = await loginWithEmailPassword(body);

    await setSessionCookie(token);

    return Response.json({ data: user }, { status: 200 });
  } catch (err) {
    return toHttpResponse(err);
  }
}
