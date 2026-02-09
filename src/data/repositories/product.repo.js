import { prisma } from "../prisma/client.js";

export async function findProductByBarcodeOrSku(q) {
  const query = String(q || "").trim();
  if (!query) return null;

  return prisma.product.findFirst({
    where: {
      isActive: true,
      OR: [{ barcode: query }, { sku: query }],
    },
    select: {
      id: true,
      name: true,
      barcode: true,
      sku: true,
      price: true,
      imageUrl: true,
      categoryId: true, // ✅ Tambahkan ini untuk filter kategori
      inventory: { select: { qtyOnHand: true } },
    },
  });
}

export async function searchProductsByName(q, limit = 20, categoryId = null) { // ✅ Tambah categoryId
  const query = String(q || "").trim();
  if (!query) return [];

  const take = Math.max(1, Math.min(Number(limit) || 20, 50));

  // ✅ Build where clause dengan kategori
  const where = {
    isActive: true,
    name: { contains: query, mode: "insensitive" },
  };

  if (categoryId) {
    where.categoryId = categoryId; // ✅ Filter by category
  }

  return prisma.product.findMany({
    where,
    orderBy: [{ name: "asc" }],
    take,
    select: {
      id: true,
      name: true,
      barcode: true,
      sku: true,
      price: true,
      imageUrl: true,
      inventory: { select: { qtyOnHand: true } },
    },
  });
}

export async function findProductsByCategory(categoryId, limit = 50) {
  const take = Math.max(1, Math.min(Number(limit) || 50, 100));

  return prisma.product.findMany({
    where: {
      isActive: true,
      categoryId: categoryId,
    },
    orderBy: [{ name: "asc" }],
    take,
    select: {
      id: true,
      name: true,
      barcode: true,
      sku: true,
      price: true,
      imageUrl: true,
      inventory: { select: { qtyOnHand: true } },
    },
  });
}

// ✅ Fungsi baru untuk get ALL products
export async function findAllActiveProducts(limit = 50) {
  const take = Math.max(1, Math.min(Number(limit) || 50, 100));

  return prisma.product.findMany({
    where: {
      isActive: true,
    },
    orderBy: [{ name: "asc" }],
    take,
    select: {
      id: true,
      name: true,
      barcode: true,
      sku: true,
      price: true,
      imageUrl: true,
      inventory: { select: { qtyOnHand: true } },
    },
  });
}
