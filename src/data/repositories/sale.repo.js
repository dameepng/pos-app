import { prisma } from "../prisma/client.js";

export async function createSaleWithItems({
  cashierId,
  total,
  saleItems,
  customerName,
}) {
  return prisma.sale.create({
    data: {
      cashierId,
      customerName: customerName || null,
      status: "PENDING",
      total,
      items: {
        create: saleItems.map((it) => ({
          productId: it.productId,
          qty: it.qty,
          price: it.price,
          subtotal: it.subtotal,
        })),
      },
    },
    include: {
      items: {
        include: {
          product: { select: { id: true, name: true, barcode: true, sku: true } },
        },
      },
    },
  });
}
