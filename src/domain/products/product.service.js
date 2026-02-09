import { AppError } from "../../lib/errors/AppError.js";
import { ERROR_CODES } from "../../lib/errors/errorCodes.js";
import {
  findProductByBarcodeOrSku,
  searchProductsByName,
  findProductsByCategory,
  findAllActiveProducts,
} from "../../data/repositories/product.repo.js";

export async function searchProducts({ q, limit, categoryId }) { // ✅ Tambah categoryId
  const query = String(q || "").trim();
  if (!query) {
    throw new AppError(
      ERROR_CODES.VALIDATION_ERROR,
      "Query parameter 'q' is required",
      400,
      [{ field: "q", message: "Required" }]
    );
  }

  const exact = await findProductByBarcodeOrSku(query);
  if (exact) {
    // ✅ Filter by category jika ada
    if (categoryId && exact.categoryId !== categoryId) {
      // Skip jika kategori tidak sesuai
    } else {
      return [
        {
          id: exact.id,
          name: exact.name,
          barcode: exact.barcode,
          sku: exact.sku,
          price: exact.price,
          imageUrl: exact.imageUrl,
          qtyOnHand: exact.inventory?.qtyOnHand ?? 0,
        },
      ];
    }
  }

  const list = await searchProductsByName(query, limit, categoryId); // ✅ Pass categoryId
  return list.map((p) => ({
    id: p.id,
    name: p.name,
    barcode: p.barcode,
    sku: p.sku,
    price: p.price,
    imageUrl: p.imageUrl,
    qtyOnHand: p.inventory?.qtyOnHand ?? 0,
  }));
}

export async function getProductsByCategory({ categoryId, limit }) {
  if (!categoryId) {
    throw new AppError(
      ERROR_CODES.VALIDATION_ERROR,
      "categoryId is required",
      400
    );
  }

  const list = await findProductsByCategory(categoryId, limit);
  return list.map((p) => ({
    id: p.id,
    name: p.name,
    barcode: p.barcode,
    sku: p.sku,
    price: p.price,
    imageUrl: p.imageUrl,
    qtyOnHand: p.inventory?.qtyOnHand ?? 0,
  }));
}

// ✅ Fungsi baru untuk get ALL products
export async function getAllProducts({ limit }) {
  const list = await findAllActiveProducts(limit);
  return list.map((p) => ({
    id: p.id,
    name: p.name,
    barcode: p.barcode,
    sku: p.sku,
    price: p.price,
    imageUrl: p.imageUrl,
    qtyOnHand: p.inventory?.qtyOnHand ?? 0,
  }));
}
