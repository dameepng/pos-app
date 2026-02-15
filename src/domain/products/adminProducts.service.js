import { unstable_cache } from "next/cache";
import { prisma } from "@/data/prisma/client";
import { CACHE_TAGS } from "@/lib/cache/cacheTags";
import {
  invalidateCatalogCaches,
  invalidateCategoryCaches,
} from "@/lib/cache/invalidation";

const ADMIN_PRODUCTS_CACHE_REVALIDATE_SEC = Math.max(
  1,
  Math.floor(Number(process.env.ADMIN_PRODUCTS_CACHE_TTL_MS || 15000) / 1000)
);
const ADMIN_CATEGORIES_CACHE_REVALIDATE_SEC = Math.max(
  1,
  Math.floor(Number(process.env.ADMIN_CATEGORIES_CACHE_TTL_MS || 60000) / 1000)
);

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

const listAdminProductsCached = unstable_cache(
  async (serializedParams) => {
    const normalized = JSON.parse(serializedParams);
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

    return {
      items,
      total,
      take: normalized.take,
      skip: normalized.skip,
    };
  },
  ["admin-products-list"],
  {
    revalidate: ADMIN_PRODUCTS_CACHE_REVALIDATE_SEC,
    tags: [CACHE_TAGS.ADMIN_PRODUCTS],
  }
);

const listAdminCategoriesCached = unstable_cache(
  async () => {
    return prisma.category.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    });
  },
  ["admin-categories-list"],
  {
    revalidate: ADMIN_CATEGORIES_CACHE_REVALIDATE_SEC,
    tags: [CACHE_TAGS.ADMIN_CATEGORIES, CACHE_TAGS.PUBLIC_CATEGORIES],
  }
);

export async function listAdminProducts(params) {
  const normalized = {
    q: (params?.q || "").trim(),
    take: Math.min(Number(params?.take || 20), 50),
    skip: Math.max(Number(params?.skip || 0), 0),
    status: (params?.status || "").trim().toLowerCase(),
    categoryId: params?.categoryId || null,
    stock: (params?.stock || "").trim().toLowerCase(),
  };

  return listAdminProductsCached(JSON.stringify(normalized));
}

export async function listAdminCategories() {
  return listAdminCategoriesCached();
}

export function invalidateAdminProductsCaches() {
  invalidateCatalogCaches();
  invalidateCategoryCaches();
}
