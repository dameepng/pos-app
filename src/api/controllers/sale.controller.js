import { prisma } from "@/data/prisma/client";
import {
  ensureDevCashierId,
  parseCashPaymentBody,
  parseSalesReportQuery,
  requireSaleId,
  validateCreateSaleBody,
} from "@/api/validators/sale.validator";
import { paySaleByCash } from "@/domain/payments/cashPayment.service";
import { createQrisPaymentForSale } from "@/domain/payments/qrisPayment.service";
import {
  createSale,
  getDailyReport,
  getPaginatedSales,
  getSalesReport,
} from "@/domain/sales/sale.service";
import { AppError } from "@/lib/errors/AppError";
import { ERROR_CODES } from "@/lib/errors/errorCodes";
import { toHttpResponse } from "@/lib/errors/toHttpResponse";

export async function createSaleHandler(req, _ctx, auth) {
  try {
    const body = await req.json();
    const validation = validateCreateSaleBody(body);

    if (validation.error) {
      return Response.json(
        { error: { message: validation.error.message } },
        { status: validation.error.status }
      );
    }

    const cashierId = auth?.user?.id;
    if (!cashierId) {
      return Response.json({ error: { message: "Unauthorized" } }, { status: 401 });
    }

    const data = await createSale({
      cashierId,
      items: validation.value.items,
      customerName: validation.value.customerName,
    });

    return Response.json({ data }, { status: 201 });
  } catch (err) {
    return toHttpResponse(err);
  }
}

export async function getSaleByIdHandler(req) {
  try {
    const saleId = requireSaleId(req);

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

export async function paySaleByCashHandler(req) {
  try {
    const cashierId = ensureDevCashierId();
    const saleId = requireSaleId(req);
    const body = await req.json();
    const { paidAmount } = parseCashPaymentBody(body);

    const data = await paySaleByCash({
      saleId,
      cashierId,
      paidAmount,
    });

    return Response.json({ data }, { status: 200 });
  } catch (err) {
    return toHttpResponse(err);
  }
}

export async function paySaleByQrisHandler(req) {
  try {
    const cashierId = ensureDevCashierId();
    const saleId = requireSaleId(req);

    const data = await createQrisPaymentForSale({
      saleId,
      cashierId,
    });

    return Response.json({ data }, { status: 200 });
  } catch (err) {
    return toHttpResponse(err);
  }
}

export async function getDailyReportHandler(req, _ctx, auth) {
  try {
    const user = auth?.user;
    if (!user) {
      return Response.json({ error: { message: "Unauthorized" } }, { status: 401 });
    }

    const cashierId = user.role === "CASHIER" ? user.id : null;

    const data = await getDailyReport({ cashierId });

    return Response.json({ data }, { status: 200 });
  } catch (err) {
    return toHttpResponse(err);
  }
}

export async function getSalesReportHandler(req) {
  try {
    const {
      startDate,
      endDate,
      period,
      pageParam,
      limitParam,
      page,
      limit,
      status,
      paymentMethod,
    } = parseSalesReportQuery(req);

    if (pageParam || limitParam) {
      if (page < 1 || limit < 1) {
        return Response.json(
          { error: { message: "Page and limit must be positive integers" } },
          { status: 400 }
        );
      }

      const result = await getPaginatedSales({
        page,
        limit,
        status,
        paymentMethod,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });

      return Response.json(
        { data: result.data, pagination: result.pagination },
        { status: 200 }
      );
    }

    if (!startDate || !endDate) {
      return Response.json(
        { error: { message: "startDate and endDate are required" } },
        { status: 400 }
      );
    }

    const report = await getSalesReport({ startDate, endDate, period });

    return Response.json(
      { data: { summary: report.summary, chartData: report.chartData } },
      { status: 200 }
    );
  } catch (err) {
    return toHttpResponse(err);
  }
}
