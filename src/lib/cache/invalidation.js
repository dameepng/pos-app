import { revalidateTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache/cacheTags";

function revalidateTags(tags) {
  const uniqueTags = Array.from(new Set(tags.filter(Boolean)));
  for (const tag of uniqueTags) {
    revalidateTag(tag);
  }
}

export function invalidateCatalogCaches() {
  revalidateTags([
    CACHE_TAGS.ADMIN_PRODUCTS,
    CACHE_TAGS.PUBLIC_PRODUCTS,
    CACHE_TAGS.ADMIN_DASHBOARD,
  ]);
}

export function invalidateCategoryCaches() {
  revalidateTags([
    CACHE_TAGS.ADMIN_CATEGORIES,
    CACHE_TAGS.PUBLIC_CATEGORIES,
    CACHE_TAGS.ADMIN_PRODUCTS,
  ]);
}

export function invalidateReceiptTemplateCache() {
  revalidateTags([CACHE_TAGS.RECEIPT_TEMPLATE]);
}

export function invalidatePostSaleCaches() {
  revalidateTags([
    CACHE_TAGS.PUBLIC_PRODUCTS,
    CACHE_TAGS.ADMIN_PRODUCTS,
    CACHE_TAGS.ADMIN_DASHBOARD,
  ]);
}
