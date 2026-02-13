import { prisma } from "../../data/prisma/client.js";

export async function getAdminDashboard() {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const todaySalesWhere = {
    createdAt: { gte: startOfDay, lte: endOfDay },
    status: { not: "CANCELLED" },
  };
  const monthSalesWhere = {
    createdAt: { gte: startOfMonth },
    status: { not: "CANCELLED" },
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
    todayCostItems,
    monthCostItems,
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
    prisma.saleItem.findMany({
      where: { sale: todaySalesWhere },
      select: {
        qty: true,
        product: { select: { cost: true } },
      },
    }),
    prisma.saleItem.findMany({
      where: monthSaleItemsWhere,
      select: {
        qty: true,
        product: { select: { cost: true } },
      },
    }),
  ]);

  const todayRevenue = todayAgg._sum.total || 0;
  const monthRevenue = monthAgg._sum.total || 0;

  const todayCost = todayCostItems.reduce(
    (sum, item) => sum + item.qty * Number(item.product?.cost || 0),
    0
  );
  const monthCost = monthCostItems.reduce(
    (sum, item) => sum + item.qty * Number(item.product?.cost || 0),
    0
  );

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

  return {
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
}
