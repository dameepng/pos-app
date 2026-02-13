import { prisma } from "../../data/prisma/client.js";

const DASHBOARD_CACHE_TTL_MS = Number(process.env.ADMIN_DASHBOARD_CACHE_TTL_MS || 15000);
let dashboardCache = {
  value: null,
  expiresAt: 0,
};

async function getSalesCostTotal({ startDate, endDate = null }) {
  const endClause = endDate ? prisma.$queryRaw`
    SELECT COALESCE(SUM(si.qty * COALESCE(p.cost, 0)), 0) AS total
    FROM "SaleItem" si
    JOIN "Sale" s ON s.id = si."saleId"
    LEFT JOIN "Product" p ON p.id = si."productId"
    WHERE s."createdAt" >= ${startDate}
      AND s."createdAt" <= ${endDate}
      AND s.status IN ('PENDING', 'PAID')
  ` : prisma.$queryRaw`
    SELECT COALESCE(SUM(si.qty * COALESCE(p.cost, 0)), 0) AS total
    FROM "SaleItem" si
    JOIN "Sale" s ON s.id = si."saleId"
    LEFT JOIN "Product" p ON p.id = si."productId"
    WHERE s."createdAt" >= ${startDate}
      AND s.status IN ('PENDING', 'PAID')
  `;

  const rows = await endClause;
  return Number(rows?.[0]?.total || 0);
}

export async function getAdminDashboard() {
  const nowTs = Date.now();
  if (dashboardCache.value && nowTs < dashboardCache.expiresAt) {
    return dashboardCache.value;
  }

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const todaySalesWhere = {
    createdAt: { gte: startOfDay, lte: endOfDay },
    status: { in: ["PENDING", "PAID"] },
  };
  const monthSalesWhere = {
    createdAt: { gte: startOfMonth },
    status: { in: ["PENDING", "PAID"] },
  };
  const monthSaleItemsWhere = {
    sale: monthSalesWhere,
  };

  const [
    todayAgg,
    monthAgg,
    todayItemsAgg,
    topProductsByRevenue,
    topProductsByQty,
    lowStock,
    recentSales,
    todayCost,
    monthCost,
  ] = await Promise.all([
    prisma.sale.aggregate({
      where: todaySalesWhere,
      _sum: { total: true },
      _count: { id: true },
    }),
    prisma.sale.aggregate({
      where: monthSalesWhere,
      _sum: { total: true },
      _count: { id: true },
    }),
    prisma.saleItem.aggregate({
      where: { sale: todaySalesWhere },
      _sum: { qty: true },
    }),
    prisma.saleItem.groupBy({
      by: ["productId"],
      where: monthSaleItemsWhere,
      _sum: { qty: true, subtotal: true },
      orderBy: { _sum: { subtotal: "desc" } },
      take: 5,
    }),
    prisma.saleItem.groupBy({
      by: ["productId"],
      where: monthSaleItemsWhere,
      _sum: { qty: true, subtotal: true },
      orderBy: { _sum: { qty: "desc" } },
      take: 5,
    }),
    prisma.product.findMany({
      where: {
        isActive: true,
        inventory: { qtyOnHand: { lte: 10 } },
      },
      select: {
        id: true,
        name: true,
        sku: true,
        inventory: { select: { qtyOnHand: true } },
      },
      orderBy: { inventory: { qtyOnHand: "asc" } },
      take: 10,
    }),
    prisma.sale.findMany({
      where: { createdAt: { gte: startOfDay } },
      select: {
        id: true,
        createdAt: true,
        total: true,
        _count: { select: { items: true } },
        payments: {
          select: { method: true },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    getSalesCostTotal({ startDate: startOfDay, endDate: endOfDay }),
    getSalesCostTotal({ startDate: startOfMonth }),
  ]);

  const todayRevenue = todayAgg._sum.total || 0;
  const monthRevenue = monthAgg._sum.total || 0;

  const todayProfit = todayRevenue - todayCost;
  const monthProfit = monthRevenue - monthCost;

  const productIds = Array.from(
    new Set([
      ...topProductsByRevenue.map((item) => item.productId),
      ...topProductsByQty.map((item) => item.productId),
    ])
  );

  const products = productIds.length
    ? await prisma.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true, name: true, sku: true },
      })
    : [];

  const productMap = new Map(products.map((p) => [p.id, p]));

  const mapTopProducts = (items) =>
    items
      .map((item) => {
        const product = productMap.get(item.productId);
        if (!product) return null;
        return {
          ...product,
          totalSold: item._sum.qty || 0,
          revenue: item._sum.subtotal || 0,
        };
      })
      .filter(Boolean);

  const topProductsByRevenueWithDetails = mapTopProducts(topProductsByRevenue);
  const topProductsByQtyWithDetails = mapTopProducts(topProductsByQty);

  const lowStockMapped = lowStock.map((p) => ({
    id: p.id,
    name: p.name,
    sku: p.sku,
    stock: p.inventory?.qtyOnHand || 0,
  }));

  const recentSalesMapped = recentSales.map((s) => ({
    id: s.id,
    createdAt: s.createdAt,
    total: s.total,
    itemCount: s._count.items,
    paymentMethod: s.payments[0]?.method === "CASH" ? "CASH" : "QRIS",
  }));

  const dashboard = {
    today: {
      revenue: todayRevenue,
      cost: todayCost,
      profit: todayProfit,
      transactions: todayAgg._count.id || 0,
      itemsSold: todayItemsAgg._sum.qty || 0,
    },
    month: {
      revenue: monthRevenue,
      cost: monthCost,
      profit: monthProfit,
      transactions: monthAgg._count.id || 0,
    },
    topProductsByRevenue: topProductsByRevenueWithDetails,
    topProductsByQty: topProductsByQtyWithDetails,
    lowStock: lowStockMapped,
    lowStockCount: lowStock.length,
    recentSales: recentSalesMapped,
  };

  dashboardCache = {
    value: dashboard,
    expiresAt: Date.now() + DASHBOARD_CACHE_TTL_MS,
  };

  return dashboard;
}
