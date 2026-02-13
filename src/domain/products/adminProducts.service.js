import { prisma } from "@/data/prisma/client";

const ADMIN_PRODUCTS_CACHE_TTL_MS = Number(process.env.ADMIN_PRODUCTS_CACHE_TTL_MS || 15000);
const ADMIN_CATEGORIES_CACHE_TTL_MS = Number(process.env.ADMIN_CATEGORIES_CACHE_TTL_MS || 60000);

const adminProductsCache = new Map();
let adminCategoriesCache = {
  value: null,
  expiresAt: 0,
};

function now() {
  return Date.now();
}

function buildAdminProductsWhere({ q, status, categoryId, stock }) {
  return {
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { sku: { contains: q, mode: "insensitive" } },
            { barcode: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
    ...(status ? { isActive: status === "active" } : {}),
    ...(categoryId ? { categoryId } : {}),
    ...(stock === "low" ? { inventory: { qtyOnHand: { lt: 5 } } } : {}),
  };
}

function getProductsCacheKey(params) {
  return JSON.stringify(params);
}

function getCachedProducts(key) {
  const hit = adminProductsCache.get(key);
  if (!hit) return null;
  if (now() >= hit.expiresAt) {
    adminProductsCache.delete(key);
    return null;
  }
  return hit.value;
}

function setCachedProducts(key, value) {
  adminProductsCache.set(key, {
    value,
    expiresAt: now() + ADMIN_PRODUCTS_CACHE_TTL_MS,
  });
}

export async function listAdminProducts(params) {
  const normalized = {
    q: (params?.q || "").trim(),
    take: Math.min(Number(params?.take || 20), 50),
    skip: Math.max(Number(params?.skip || 0), 0),
    status: (params?.status || "").trim().toLowerCase(),
    categoryId: params?.categoryId || null,
    stock: (params?.stock || "").trim().toLowerCase(),
  };

  const key = getProductsCacheKey(normalized);
  const cached = getCachedProducts(key);
  if (cached) return cached;

  const where = buildAdminProductsWhere(normalized);

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        category: { select: { id: true, name: true } },
        inventory: { select: { productId: true, qtyOnHand: true } },
      },
      orderBy: { createdAt: "desc" },
      take: normalized.take,
      skip: normalized.skip,
    }),
    prisma.product.count({ where }),
  ]);

  const data = {
    items,
    total,
    take: normalized.take,
    skip: normalized.skip,
  };
  setCachedProducts(key, data);
  return data;
}

export async function listAdminCategories() {
  if (adminCategoriesCache.value && now() < adminCategoriesCache.expiresAt) {
    return adminCategoriesCache.value;
  }

  const categories = await prisma.category.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  adminCategoriesCache = {
    value: categories,
    expiresAt: now() + ADMIN_CATEGORIES_CACHE_TTL_MS,
  };

  return categories;
}

export function invalidateAdminProductsCaches() {
  adminProductsCache.clear();
  adminCategoriesCache = {
    value: null,
    expiresAt: 0,
  };
}
