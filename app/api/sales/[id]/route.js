import { toHttpResponse } from "../../../../src/lib/errors/toHttpResponse.js";
import { prisma } from "../../../../src/data/prisma/client.js";
import { AppError } from "../../../../src/lib/errors/AppError.js";
import { ERROR_CODES } from "../../../../src/lib/errors/errorCodes.js";
import { getSaleById } from "../../../../src/data/repositories/saleQuery.repo.js";

function extractSaleIdFromUrl(url) {
  const u = new URL(url);
  const parts = u.pathname.split("/").filter(Boolean);
  const idx = parts.indexOf("sales");
  if (idx === -1) return null;
  return parts[idx + 1] || null;
}

export async function GET(req) {
  try {
    const saleId = extractSaleIdFromUrl(req.url);

    if (!saleId) {
      throw new AppError(ERROR_CODES.VALIDATION_ERROR, "saleId is required", 400);
    }

    const sale = await prisma.sale.findUnique({
      where: { id: saleId },
      include: {
        items: {
          include: {
            product: {
              select: { id: true, name: true, barcode: true, sku: true },
            },
          },
        },
        payments: true,
        cashier: { select: { id: true, name: true, email: true, role: true } },
      },
    });

    if (!sale) {
      throw new AppError(ERROR_CODES.SALE_NOT_FOUND, "Sale not found", 404);
    }

    return Response.json(
      {
        data: {
          saleId: sale.id,
          status: sale.status,
          total: sale.total,
          createdAt: sale.createdAt,
          customerName: sale.customerName,
          cashier: sale.cashier,
          items: sale.items.map((it) => ({
            productId: it.productId,
            name: it.product?.name,
            qty: it.qty,
            price: it.price,
            subtotal: it.subtotal,
          })),
          payments: sale.payments.map((p) => ({
            id: p.id,
            method: p.method,
            provider: p.provider,
            amount: p.amount,
            status: p.status,
            createdAt: p.createdAt,
          })),
        },
      },
      { status: 200 }
    );
  } catch (err) {
    return toHttpResponse(err);
  }
}
