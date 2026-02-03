import { requireRole } from "@/domain/auth/auth.service";
import { toHttpResponse } from "@/lib/errors/toHttpResponse";
import { getAdminDashboard } from "@/domain/dashboard/dashboard.service";

export async function GET(req) {
  try {
    await requireRole(["ADMIN"]);
    
    const data = await getAdminDashboard();

    return Response.json({ data }, { status: 200 });
  } catch (err) {
    return toHttpResponse(err);
  }
}