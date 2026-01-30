import { toHttpResponse } from "@/lib/errors/toHttpResponse";
import { getAuthUserFromRequest } from "@/domain/auth/auth.service";

export async function GET() {
  try {
    const user = await getAuthUserFromRequest();
    return Response.json({ data: user }, { status: 200 });
  } catch (err) {
    return toHttpResponse(err);
  }
}
