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

// helper: deteksi check constraint inventory qty non-negative
function isInventoryNonNegativeViolation(err) {
  const msg = String(err?.message || "");
  return msg.includes("inventory_qty_nonnegative") || msg.includes("Inventory");
}

export async function paySaleByCash({ saleId, cashierId, paidAmount }) {
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

        // Re-check stok sebelum decrement (policy safety)
        for (const it of sale.items) {
          const p = it.product;
          const qtyOnHand = p?.inventory?.qtyOnHand ?? 0;

          if (!p?.isActive) {
            throw new AppError(
              ERROR_CODES.VALIDATION_ERROR,
              `Product inactive: ${p?.name || it.productId}`,
              409
            );
          }

          if (it.qty > qtyOnHand) {
            throw new AppError(
              ERROR_CODES.INSUFFICIENT_STOCK,
              `Insufficient stock for product ${p.name}`,
              409,
              [{ field: "items", message: `${p.name} stock ${qtyOnHand}, requested ${it.qty}` }]
            );
          }
        }

        // 1) Decrement inventory
        // (Kalau race condition terjadi, CHECK constraint akan ngeblok qty minus)
        for (const it of sale.items) {
          await tx.inventory.update({
            where: { productId: it.productId },
            data: { qtyOnHand: { decrement: it.qty } },
          });
        }

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

        return {
          saleId: updatedSale.id,
          status: updatedSale.status,
          total: updatedSale.total,
          paidAmount: paid,
          change,
          paymentId: payment.id,
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
