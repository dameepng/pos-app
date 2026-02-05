import { z } from "zod";
import { AppError } from "@/lib/errors/AppError";
import { ERROR_CODES } from "@/lib/errors/errorCodes";

const SalesReportQuerySchema = z.object({
  startDate: z.string().nullable().default(null),
  endDate: z.string().nullable().default(null),
  period: z.string().default("7days"),
  pageParam: z.string().nullable().default(null),
  limitParam: z.string().nullable().default(null),
  page: z.coerce.number().default(1),
  limit: z.coerce.number().default(25),
  status: z.string().optional(),
  paymentMethod: z.string().optional(),
});

const CreateSaleSchema = z.object({
  items: z.array(z.any()).min(1, "items is required"),
  customerName: z.string().nullable().optional(),
});

function extractSaleIdFromUrl(url) {
  const u = new URL(url);
  const parts = u.pathname.split("/").filter(Boolean);
  const idx = parts.indexOf("sales");
  if (idx === -1) return null;
  return parts[idx + 1] || null;
}

export function requireSaleId(req) {
  const saleId = extractSaleIdFromUrl(req.url);
  if (!saleId) {
    throw new AppError(ERROR_CODES.VALIDATION_ERROR, "saleId is required", 400);
  }
  return saleId;
}

export function ensureDevCashierId() {
  if (!process.env.DEV_CASHIER_ID) {
    throw new Error("DEV_CASHIER_ID is not set in .env.local");
  }

  return process.env.DEV_CASHIER_ID;
}

export function parseCashPaymentBody(body) {
  return { paidAmount: body?.paidAmount };
}

export function validateCreateSaleBody(body) {
  const result = CreateSaleSchema.safeParse(body ?? {});

  if (!result.success) {
    return { error: { message: result.error.issues[0]?.message, status: 400 } };
  }

  return {
    value: {
      items: result.data.items,
      customerName: result.data.customerName ?? null,
    },
  };
}

export function parseSalesReportQuery(req) {
  const { searchParams } = new URL(req.url);

  return SalesReportQuerySchema.parse({
    startDate: searchParams.get("startDate"),
    endDate: searchParams.get("endDate"),
    period: searchParams.get("period") ?? undefined,
    pageParam: searchParams.get("page"),
    limitParam: searchParams.get("limit"),
    page: searchParams.get("page") ?? undefined,
    limit: searchParams.get("limit") ?? undefined,
    status: searchParams.get("status") ?? undefined,
    paymentMethod: searchParams.get("paymentMethod") ?? undefined,
  });
}
