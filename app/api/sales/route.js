import { createSale } from "@/domain/sales/sale.service";
import { requireRole } from "@/domain/auth/auth.service";
import { toHttpResponse } from "@/lib/errors/toHttpResponse";

export async function POST(req) {
  try {
    // 1. Auth guard (hanya CASHIER / ADMIN boleh buat sale)
    const user = await requireRole(["CASHIER", "ADMIN"]);

    // 2. Parse body
    const body = await req.json();
    const items = body?.items;

    // 3. CashierId otomatis dari session user
    const cashierId = user.id;

    // 4. Call business logic
    const data = await createSale({
      cashierId,
      items,
    });

    return Response.json({ data }, { status: 201 });
  } catch (err) {
    return toHttpResponse(err);
  }
}
