import { AppError } from "../../lib/errors/AppError.js";
import { ERROR_CODES } from "../../lib/errors/errorCodes.js";
import { createSaleWithItems } from "../../data/repositories/sale.repo.js";
import { findActiveProductsByIds } from "../../data/repositories/productRead.repo.js";
import { prisma } from "../../data/prisma/client.js";

function normalizeItems(items) {
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

  return Array.from(map.entries()).map(([productId, qty]) => ({ productId, qty }));
}

export async function createSale({ cashierId, items }) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new AppError(
      ERROR_CODES.VALIDATION_ERROR,
      "items is required",
      400,
      [{ field: "items", message: "Must be a non-empty array" }]
    );
  }

  const normalized = normalizeItems(items);
  if (normalized.length === 0) {
    throw new AppError(
      ERROR_CODES.VALIDATION_ERROR,
      "items is required",
      400,
      [{ field: "items", message: "Must contain at least 1 valid item" }]
    );
  }

  const productIds = normalized.map((x) => x.productId);
  const products = await findActiveProductsByIds(productIds);

  const productMap = new Map(products.map((p) => [p.id, p]));

  for (const it of normalized) {
    if (!productMap.has(it.productId)) {
      throw new AppError(
        ERROR_CODES.PRODUCT_NOT_FOUND,
        "Product not found",
        404,
        [{ field: "items.productId", message: `Not found: ${it.productId}` }]
      );
    }
  }

  // Policy MVP: cek stok saat create sale
  for (const it of normalized) {
    const p = productMap.get(it.productId);
    const qtyOnHand = p.inventory?.qtyOnHand ?? 0;

    if (it.qty > qtyOnHand) {
      throw new AppError(
        ERROR_CODES.INSUFFICIENT_STOCK,
        `Insufficient stock for product ${p.name}`,
        409,
        [{ field: "items", message: `${p.name} stock ${qtyOnHand}, requested ${it.qty}` }]
      );
    }
  }

  const saleItems = normalized.map((it) => {
    const p = productMap.get(it.productId);
    const price = p.price;
    const subtotal = it.qty * price;

    return { productId: it.productId, qty: it.qty, price, subtotal };
  });

  const total = saleItems.reduce((sum, it) => sum + it.subtotal, 0);

  const sale = await createSaleWithItems({
    cashierId,
    total,
    saleItems,
  });

  return {
    saleId: sale.id,
    status: sale.status,
    total: sale.total,
    createdAt: sale.createdAt,
    items: sale.items.map((it) => ({
      productId: it.productId,
      name: it.product?.name,
      qty: it.qty,
      price: it.price,
      subtotal: it.subtotal,
    })),
  };
}

// ✅ Fungsi untuk Daily Report
export async function getDailyReport({ cashierId }) {
  // Get start dan end of today (00:00:00 - 23:59:59)
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const where = {
    createdAt: {
      gte: startOfDay,
      lte: endOfDay,
    },
    status: {
      not: "CANCELLED", // ✅ Exclude cancelled sales
    },
  };

  // Filter by cashier jika CASHIER (bukan ADMIN)
  if (cashierId) {
    where.cashierId = cashierId;
  }

  // Get all sales for today
  const sales = await prisma.sale.findMany({
    where,
    include: {
      items: {
        include: {
          product: {
            select: { name: true },
          },
        },
      },
      payments: true, // ✅ Include payments untuk cek metode
    },
    orderBy: { createdAt: "desc" },
  });

  // ✅ Calculate summary berdasarkan Payment
  const summary = {
    totalSales: sales.length,
    totalRevenue: sales.reduce((sum, s) => sum + s.total, 0),
    cashRevenue: 0,
    cashCount: 0,
    midtransRevenue: 0,
    midtransCount: 0,
  };

  // Group by payment method
  for (const sale of sales) {
    for (const payment of sale.payments) {
      if (payment.method === "CASH") {
        summary.cashRevenue += payment.amount;
        summary.cashCount++;
      } else if (payment.method === "QRIS") {
        summary.midtransRevenue += payment.amount;
        summary.midtransCount++;
      }
    }
  }

  return {
    summary,
    sales: sales.map((sale) => ({
      id: sale.id,
      createdAt: sale.createdAt,
      total: sale.total,
      status: sale.status,
      items: sale.items,
      // ✅ Ambil payment method dari payments
      paymentMethod: sale.payments[0]?.method || "N/A",
      totalAmount: sale.total,
    })),
  };
}

// ... existing functions ...

// // ✅ Fungsi baru untuk Admin Sales Report (dengan date range)
// export async function getSalesReport({ startDate, endDate }) {
//   // Parse dates
//   const start = new Date(startDate);
//   start.setHours(0, 0, 0, 0);

//   const end = new Date(endDate);
//   end.setHours(23, 59, 59, 999);

//   const where = {
//     createdAt: {
//       gte: start,
//       lte: end,
//     },
//     status: {
//       not: "CANCELLED",
//     },
//   };

//   // Get all sales in date range
//   const sales = await prisma.sale.findMany({
//     where,
//     include: {
//       items: {
//         include: {
//           product: {
//             select: { name: true },
//           },
//         },
//       },
//       payments: true,
//       cashier: {
//         select: {
//           email: true,
//           name: true,
//         },
//       },
//     },
//     orderBy: { createdAt: "desc" },
//   });

//   // Calculate summary
//   const summary = {
//     totalSales: sales.length,
//     totalRevenue: sales.reduce((sum, s) => sum + s.total, 0),
//     cashRevenue: 0,
//     cashCount: 0,
//     midtransRevenue: 0,
//     midtransCount: 0,
//   };

//   // Group by payment method
//   for (const sale of sales) {
//     for (const payment of sale.payments) {
//       if (payment.method === "CASH") {
//         summary.cashRevenue += payment.amount;
//         summary.cashCount++;
//       } else if (payment.method === "QRIS") {
//         summary.midtransRevenue += payment.amount;
//         summary.midtransCount++;
//       }
//     }
//   }

//   return {
//     summary,
//     sales: sales.map((sale) => ({
//       id: sale.id,
//       createdAt: sale.createdAt,
//       total: sale.total,
//       status: sale.status,
//       items: sale.items,
//       paymentMethod: sale.payments[0]?.method || "N/A",
//       totalAmount: sale.total,
//       cashier: sale.cashier,
//     })),
//   };
// }

export async function getSalesReport({ startDate, endDate, period = "7days" }) {
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);

  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);

  const where = {
    createdAt: { gte: start, lte: end },
    status: { not: "CANCELLED" },
  };

  const sales = await prisma.sale.findMany({
    where,
    include: {
      items: {
        include: {
          product: { select: { name: true } },
        },
      },
      payments: true,
      cashier: { select: { email: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const summary = {
    totalSales: sales.length,
    totalRevenue: sales.reduce((sum, s) => sum + s.total, 0),
    cashRevenue: 0,
    cashCount: 0,
    midtransRevenue: 0,
    midtransCount: 0,
  };

  for (const sale of sales) {
    for (const payment of sale.payments) {
      if (payment.method === "CASH") {
        summary.cashRevenue += payment.amount;
        summary.cashCount++;
      } else if (payment.method === "QRIS") {
        summary.midtransRevenue += payment.amount;
        summary.midtransCount++;
      }
    }
  }

  // --- chartData generation ---
  const chartMap = new Map();

  const idDay = (d) =>
    d.toLocaleDateString("id-ID", { day: "2-digit", month: "2-digit" }); // "03/02"
  const idWeekday = (d) =>
    d.toLocaleDateString("id-ID", { weekday: "short" }); // "Sen"
  const idMonth = (d) =>
    d.toLocaleDateString("id-ID", { month: "short" }); // "Jan"

  for (const sale of sales) {
    const dt = new Date(sale.createdAt);

    let key;
    let date;
    let label;

    if (period === "1year") {
      // group by month
      key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}`;
      date = idMonth(dt);
      label = dt.toLocaleDateString("id-ID", { month: "long", year: "numeric" });
    } else {
      // group by day (7days / 30days / custom range)
      key = dt.toISOString().slice(0, 10); // YYYY-MM-DD
      date = period === "7days" ? idWeekday(dt) : idDay(dt);
      label = dt.toLocaleDateString("id-ID", {
        weekday: period === "7days" ? "long" : undefined,
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
    }

    const prev = chartMap.get(key) || {
      date,
      label,
      revenue: 0,
      transactions: 0,
    };

    prev.revenue += Number(sale.total || 0);
    prev.transactions += 1;

    chartMap.set(key, prev);
  }

  // sort chronological
  const chartData = Array.from(chartMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([, v]) => v);

  return {
    summary,
    sales: sales.map((sale) => ({
      id: sale.id,
      createdAt: sale.createdAt,
      total: sale.total,
      status: sale.status,
      items: sale.items,
      paymentMethod: sale.payments[0]?.method || "N/A",
      totalAmount: sale.total,
      cashier: sale.cashier,
    })),
    chartData,
  };
}
