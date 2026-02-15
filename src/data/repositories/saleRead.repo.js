import { prisma } from "../prisma/client.js";

export async function getSaleForPayment(tx, saleId) {
  // tx: prisma transaction client
  return tx.sale.findUnique({
    where: { id: saleId },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              isActive: true,
            },
          },
        },
      },
    },
  });
}
