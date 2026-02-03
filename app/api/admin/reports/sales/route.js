import { requireRole } from "@/domain/auth/auth.service";
import { toHttpResponse } from "@/lib/errors/toHttpResponse";
import { getSalesReport } from "@/domain/sales/sale.service";

export async function GET(req) {
  try {
    await requireRole(["ADMIN"]); // Only ADMIN can access

    const { searchParams } = new URL(req.url);

    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // ✅ Tambahkan ini (biar period tidak undefined)
    const period = searchParams.get("period") || "7days";

    if (!startDate || !endDate) {
      return Response.json(
        { error: { message: "startDate and endDate are required" } },
        { status: 400 }
      );
    }

    // ✅ Sekarang period sudah ada
    const data = await getSalesReport({
      startDate,
      endDate,
      period,
    });

    return Response.json({ data }, { status: 200 });
  } catch (err) {
    return toHttpResponse(err);
  }
}
