import { AppError } from "../../lib/errors/AppError.js";
import { ERROR_CODES } from "../../lib/errors/errorCodes.js";
import { prisma } from "../../data/prisma/client.js";
import { getSaleForPayment } from "../../data/repositories/saleRead.repo.js";

const CASH_PAYMENT_TX_MAX_WAIT_MS = Number(
  process.env.CASH_PAYMENT_TX_MAX_WAIT_MS || 10000
);
const CASH_PAYMENT_TX_TIMEOUT_MS = Number(
  process.env.CASH_PAYMENT_TX_TIMEOUT_MS || 20000
);
const CASH_CHECKOUT_TX_ISOLATION_LEVEL =
  process.env.CASH_CHECKOUT_TX_ISOLATION_LEVEL || "ReadCommitted";

// helper: deteksi check constraint inventory qty non-negative
function isInventoryNonNegativeViolation(err) {
  const msg = String(err?.message || "");
  return msg.includes("inventory_qty_nonnegative") || msg.includes("Inventory");
}

function mergeInventoryDeductions(items) {
  const map = new Map();
  for (const it of items) {
    const productId = String(it?.productId || "").trim();
    const qty = Number(it?.qty || 0);
    const name = String(it?.productName || it?.name || "").trim() || productId;
    if (!productId || qty <= 0) continue;

    const current = map.get(productId);
    if (current) {
      current.qty += qty;
    } else {
      map.set(productId, { productId, qty, name });
    }
  }

  return Array.from(map.values());
}

async function decrementInventoryBatch(tx, deductionLines) {
  if (!Array.isArray(deductionLines) || deductionLines.length === 0) return;

  const payload = JSON.stringify(
    deductionLines.map((line) => ({
      product_id: line.productId,
      qty: line.qty,
    }))
  );

  const result = await tx.$queryRaw`
    WITH req AS (
      SELECT
        x.product_id::text AS product_id,
        x.qty::int AS qty
      FROM jsonb_to_recordset(${payload}::jsonb) AS x(product_id text, qty int)
    ),
    upd AS (
      UPDATE "Inventory" AS inv
      SET
        "qtyOnHand" = inv."qtyOnHand" - req.qty,
        "updatedAt" = NOW()
      FROM req
      WHERE inv."productId" = req.product_id
        AND inv."qtyOnHand" >= req.qty
      RETURNING inv."productId"
    )
    SELECT
      (SELECT COUNT(*)::int FROM req) AS requested_count,
      (SELECT COUNT(*)::int FROM upd) AS updated_count
  `;

  const requestedCount = Number(result?.[0]?.requested_count || 0);
  const updatedCount = Number(result?.[0]?.updated_count || 0);
  if (requestedCount === updatedCount) return;

  const stocks = await tx.inventory.findMany({
    where: { productId: { in: deductionLines.map((line) => line.productId) } },
    select: { productId: true, qtyOnHand: true },
  });
  const stockMap = new Map(stocks.map((row) => [row.productId, row.qtyOnHand]));
  const failedLine =
    deductionLines.find((line) => (stockMap.get(line.productId) ?? 0) < line.qty) ||
    deductionLines[0];
  const qtyOnHand = stockMap.get(failedLine.productId) ?? 0;

  throw new AppError(
    ERROR_CODES.INSUFFICIENT_STOCK,
    `Insufficient stock for product ${failedLine.name}`,
    409,
    [
      {
        field: "items",
        message: `${failedLine.name} stock ${qtyOnHand}, requested ${failedLine.qty}`,
      },
    ]
  );
}

function normalizeCheckoutItems(items) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new AppError(
      ERROR_CODES.VALIDATION_ERROR,
      "items is required",
      400,
      [{ field: "items", message: "Must be a non-empty array" }]
    );
  }

  const map = new Map();
  for (const it of items) {
    const productId = String(it?.productId || "").trim();
    const qty = Number(it?.qty);

    if (!productId) continue;

    if (!Number.isInteger(qty) || qty <= 0) {
      throw new AppError(
        ERROR_CODES.VALIDATION_ERROR,
        "qty must be an integer >= 1",
        400,
        [{ field: "items.qty", message: "qty must be integer >= 1" }]
      );
    }

    map.set(productId, (map.get(productId) || 0) + qty);
  }

  const normalized = Array.from(map.entries()).map(([productId, qty]) => ({
    productId,
    qty,
  }));

  if (normalized.length === 0) {
    throw new AppError(
      ERROR_CODES.VALIDATION_ERROR,
      "items is required",
      400,
      [{ field: "items", message: "Must contain at least 1 valid item" }]
    );
  }

  return normalized;
}

export async function createAndPaySaleByCash({
  cashierId,
  cashierName,
  items,
  customerName,
  paidAmount,
}) {
  const cashierIdStr = String(cashierId || "").trim();
  if (!cashierIdStr) {
    throw new AppError(ERROR_CODES.UNAUTHORIZED, "Unauthorized", 401);
  }

  const normalizedItems = normalizeCheckoutItems(items);
  const paid = Number(paidAmount);
  if (!Number.isFinite(paid) || paid <= 0) {
    throw new AppError(
      ERROR_CODES.VALIDATION_ERROR,
      "paidAmount must be a positive number",
      400,
      [{ field: "paidAmount", message: "Must be > 0" }]
    );
  }

  try {
    return await prisma.$transaction(
      async (tx) => {
        const productIds = normalizedItems.map((it) => it.productId);
        const products = await tx.product.findMany({
          where: {
            id: { in: productIds },
            isActive: true,
          },
          select: {
            id: true,
            name: true,
            price: true,
          },
        });

        const productMap = new Map(products.map((p) => [p.id, p]));

        for (const it of normalizedItems) {
          if (!productMap.has(it.productId)) {
            throw new AppError(
              ERROR_CODES.PRODUCT_NOT_FOUND,
              "Product not found",
              404,
              [{ field: "items.productId", message: `Not found: ${it.productId}` }]
            );
          }
        }

        const saleItems = normalizedItems.map((it) => {
          const product = productMap.get(it.productId);
          return {
            productId: it.productId,
            qty: it.qty,
            price: product.price,
            subtotal: it.qty * product.price,
            productName: product.name,
          };
        });

        const total = saleItems.reduce((sum, it) => sum + it.subtotal, 0);
        if (paid < total) {
          throw new AppError(
            ERROR_CODES.INSUFFICIENT_CASH,
            "Paid amount is less than total",
            409,
            [{ field: "paidAmount", message: `Need at least ${total}` }]
          );
        }

        const deductions = mergeInventoryDeductions(
          saleItems.map((it) => ({
            productId: it.productId,
            qty: it.qty,
            productName: it.productName,
          }))
        );
        await decrementInventoryBatch(tx, deductions);

        const cleanCustomerName = String(customerName || "").trim() || null;
        const sale = await tx.sale.create({
          data: {
            cashierId: cashierIdStr,
            customerName: cleanCustomerName,
            status: "PAID",
            total,
          },
          select: {
            id: true,
            status: true,
            total: true,
            createdAt: true,
            customerName: true,
          },
        });

        await tx.saleItem.createMany({
          data: saleItems.map((it) => ({
            saleId: sale.id,
            productId: it.productId,
            qty: it.qty,
            price: it.price,
            subtotal: it.subtotal,
          })),
        });

        await tx.stockMovement.createMany({
          data: saleItems.map((it) => ({
            productId: it.productId,
            type: "SALE",
            qtyDelta: -it.qty,
            refSaleId: sale.id,
            note: "Cash checkout",
          })),
        });

        const payment = await tx.payment.create({
          data: {
            saleId: sale.id,
            method: "CASH",
            provider: "NONE",
            amount: sale.total,
            status: "PAID",
          },
          select: {
            id: true,
          },
        });

        const change = paid - sale.total;

        return {
          saleId: sale.id,
          status: sale.status,
          total: sale.total,
          paidAmount: paid,
          change,
          paymentId: payment.id,
          receipt: {
            saleId: sale.id,
            createdAt: sale.createdAt,
            customerName: sale.customerName,
            cashierName: cashierName || null,
            items: saleItems.map((it) => ({
              productId: it.productId,
              name: it.productName,
              qty: it.qty,
              price: it.price,
              subtotal: it.subtotal,
            })),
            total: sale.total,
            paymentMethod: "CASH",
          },
        };
      },
      {
        isolationLevel: CASH_CHECKOUT_TX_ISOLATION_LEVEL,
        maxWait: CASH_PAYMENT_TX_MAX_WAIT_MS,
        timeout: CASH_PAYMENT_TX_TIMEOUT_MS,
      }
    );
  } catch (err) {
    if (isInventoryNonNegativeViolation(err)) {
      throw new AppError(
        ERROR_CODES.INSUFFICIENT_STOCK,
        "Insufficient stock (race condition detected)",
        409
      );
    }

    if (err instanceof AppError) throw err;
    throw err;
  }
}

export async function paySaleByCash({ saleId, cashierId, cashierName, paidAmount }) {
  const saleIdStr = String(saleId || "").trim();
  if (!saleIdStr) {
    throw new AppError(ERROR_CODES.VALIDATION_ERROR, "saleId is required", 400);
  }

  const paid = Number(paidAmount);
  if (!Number.isFinite(paid) || paid <= 0) {
    throw new AppError(
      ERROR_CODES.VALIDATION_ERROR,
      "paidAmount must be a positive number",
      400,
      [{ field: "paidAmount", message: "Must be > 0" }]
    );
  }

  try {
    const result = await prisma.$transaction(
      async (tx) => {
        const sale = await getSaleForPayment(tx, saleIdStr);

        if (!sale) {
          throw new AppError(ERROR_CODES.SALE_NOT_FOUND, "Sale not found", 404);
        }

        if (sale.status !== "PENDING") {
          throw new AppError(
            ERROR_CODES.SALE_ALREADY_PAID,
            `Sale status is ${sale.status}`,
            409
          );
        }

        if (!sale.items || sale.items.length === 0) {
          throw new AppError(
            ERROR_CODES.VALIDATION_ERROR,
            "Sale has no items",
            400
          );
        }

        if (paid < sale.total) {
          throw new AppError(
            ERROR_CODES.INSUFFICIENT_CASH,
            "Paid amount is less than total",
            409,
            [{ field: "paidAmount", message: `Need at least ${sale.total}` }]
          );
        }

        const deductionItems = [];
        for (const it of sale.items) {
          const p = it.product;

          if (!p?.isActive) {
            throw new AppError(
              ERROR_CODES.VALIDATION_ERROR,
              `Product inactive: ${p?.name || it.productId}`,
              409
            );
          }

          deductionItems.push({
            productId: it.productId,
            qty: it.qty,
            productName: p.name,
          });
        }

        // 1) Decrement inventory atomically in one query.
        await decrementInventoryBatch(tx, mergeInventoryDeductions(deductionItems));

        // 2) Create stock movements
        await tx.stockMovement.createMany({
          data: sale.items.map((it) => ({
            productId: it.productId,
            type: "SALE",
            qtyDelta: -it.qty,
            refSaleId: sale.id,
            note: "Cash payment",
          })),
        });

        // 3) Create payment record (langsung PAID)
        const payment = await tx.payment.create({
          data: {
            saleId: sale.id,
            method: "CASH",
            provider: "NONE",
            amount: sale.total,
            status: "PAID",
          },
        });

        // 4) Update sale status -> PAID
        const updatedSale = await tx.sale.update({
          where: { id: sale.id },
          data: { status: "PAID" },
        });

        const change = paid - updatedSale.total;
        const receipt = {
          saleId: updatedSale.id,
          createdAt: updatedSale.createdAt,
          customerName: updatedSale.customerName,
          cashierName: cashierName || null,
          items: sale.items.map((it) => ({
            productId: it.productId,
            name: it.product?.name,
            qty: it.qty,
            price: it.price,
            subtotal: it.subtotal,
          })),
          total: updatedSale.total,
          paymentMethod: "CASH",
        };

        return {
          saleId: updatedSale.id,
          status: updatedSale.status,
          total: updatedSale.total,
          paidAmount: paid,
          change,
          paymentId: payment.id,
          receipt,
        };
      },
      {
        isolationLevel: "Serializable",
        maxWait: CASH_PAYMENT_TX_MAX_WAIT_MS,
        timeout: CASH_PAYMENT_TX_TIMEOUT_MS,
      }
    );

    return result;
  } catch (err) {
    // map constraint/race stock negative
    if (isInventoryNonNegativeViolation(err)) {
      throw new AppError(
        ERROR_CODES.INSUFFICIENT_STOCK,
        "Insufficient stock (race condition detected)",
        409
      );
    }

    // bubble known AppError
    if (err instanceof AppError) throw err;

    throw err;
  }
}
