import { prisma } from "@/data/prisma/client";
import { Prisma } from "@/generated/prisma";
import { promises as fs } from "fs";
import path from "path";
import { optimizeImageUpload } from "@/lib/images/optimizeUpload";
import {
  deleteFromSupabaseByPublicUrl,
  isSupabaseStorageEnabled,
  uploadBufferToSupabase,
} from "@/lib/storage/supabaseStorage";
import {
  buildProductPatchData,
  buildProductPayload,
  parseAdminListProductsQuery,
  parseAdminSearchProductsQuery,
  parseGetAllProductsQuery,
  parseGetProductsByCategoryQuery,
  parseSearchProductsQuery,
  validateProductCreatePayload,
  validateProductUpdatePayload,
} from "@/api/validators/product.validator";
import {
  getAllProducts,
  getProductsByCategory,
  searchProducts,
} from "@/domain/products/product.service";
import {
  invalidateAdminProductsCaches,
  listAdminProducts,
} from "@/domain/products/adminProducts.service";
import { toHttpResponse } from "@/lib/errors/toHttpResponse";

async function removeProductImageAsset(imageUrl) {
  if (!imageUrl) return;

  if (imageUrl.startsWith("/uploads/products/")) {
    const oldPath = path.join(process.cwd(), "public", imageUrl.replace(/^\/+/, ""));
    await fs.unlink(oldPath).catch(() => {});
    return;
  }

  await deleteFromSupabaseByPublicUrl(imageUrl).catch(() => {});
}

export async function getAllProductsHandler(req) {
  try {
    const { page, limit } = parseGetAllProductsQuery(req);

    const result = await getAllProducts({ page, limit });

    return Response.json(
      { data: result.data, pagination: result.pagination },
      { status: 200 }
    );
  } catch (err) {
    return toHttpResponse(err);
  }
}

export async function getProductsByCategoryHandler(req) {
  try {
    const { categoryId, page, limit } = parseGetProductsByCategoryQuery(req);

    const result = await getProductsByCategory({ categoryId, page, limit });

    return Response.json(
      { data: result.data, pagination: result.pagination },
      { status: 200 }
    );
  } catch (err) {
    return toHttpResponse(err);
  }
}

export async function searchProductsHandler(req) {
  try {
    const { q, page, limit, categoryId } = parseSearchProductsQuery(req);

    const result = await searchProducts({ q, page, limit, categoryId });

    return Response.json(
      { data: result.data, pagination: result.pagination },
      { status: 200 }
    );
  } catch (err) {
    return toHttpResponse(err);
  }
}

export async function adminSearchProductsHandler(req) {
  try {
    const { q, page, limit } = parseAdminSearchProductsQuery(req);

    const result = await searchProducts({ q, page, limit });

    return Response.json(
      { data: result.data, pagination: result.pagination },
      { status: 200 }
    );
  } catch (err) {
    return toHttpResponse(err);
  }
}

export async function adminListProductsHandler(req) {
  try {
    const { q, take, skip, status, categoryId, stock } =
      parseAdminListProductsQuery(req);

    const data = await listAdminProducts({ q, take, skip, status, categoryId, stock });
    return Response.json({ data }, { status: 200 });
  } catch (err) {
    return toHttpResponse(err);
  }
}

export async function adminCreateProductHandler(req) {
  try {
    const body = await req.json();

    const payload = buildProductPayload(body);
    const validation = validateProductCreatePayload(payload);

    if (validation.error) {
      return Response.json(
        { error: { message: validation.error.message } },
        { status: validation.error.status }
      );
    }

    const data = await prisma.product.create({
      data: {
        name: validation.value.name,
        sku: validation.value.sku,
        barcode: validation.value.barcode,
        price: validation.value.price,
        cost: validation.value.cost,
        isActive: validation.value.isActive,
        categoryId: validation.value.categoryId,
        inventory: { create: { qtyOnHand: validation.value.qtyOnHand } },
      },
      include: { category: true, inventory: true },
    });

    invalidateAdminProductsCaches();
    return Response.json({ data }, { status: 201 });
  } catch (err) {
    return toHttpResponse(err);
  }
}

export async function adminGetProductHandler(req, { params }) {
  try {
    const { id } = await params;
    const data = await prisma.product.findUnique({
      where: { id },
      include: { category: true, inventory: true },
    });

    return Response.json({ data }, { status: 200 });
  } catch (err) {
    return toHttpResponse(err);
  }
}

export async function adminUpdateProductHandler(req, { params }) {
  try {
    const { id } = await params;
    const body = await req.json();

    const payload = buildProductPayload(body);
    const validation = validateProductUpdatePayload(payload);

    if (validation.error) {
      return Response.json(
        { error: { message: validation.error.message } },
        { status: validation.error.status }
      );
    }

    const data = await prisma.product.update({
      where: { id },
      data: {
        name: validation.value.name,
        sku: validation.value.sku,
        barcode: validation.value.barcode,
        price: validation.value.price,
        cost: validation.value.cost,
        isActive: validation.value.isActive,
        categoryId: validation.value.categoryId,
        inventory: {
          upsert: {
            create: { qtyOnHand: validation.value.qtyOnHand },
            update: { qtyOnHand: validation.value.qtyOnHand },
          },
        },
      },
      include: { category: true, inventory: true },
    });

    invalidateAdminProductsCaches();
    return Response.json({ data }, { status: 200 });
  } catch (err) {
    return toHttpResponse(err);
  }
}

export async function adminPatchProductHandler(req, { params }) {
  try {
    const { id } = await params;
    const body = await req.json();

    const dataUpdate = buildProductPatchData(body);

    const data = await prisma.product.update({
      where: { id },
      data: dataUpdate,
      include: { category: true, inventory: true },
    });

    invalidateAdminProductsCaches();
    return Response.json({ data }, { status: 200 });
  } catch (err) {
    return toHttpResponse(err);
  }
}

export async function adminDeleteProductHandler(req, { params }) {
  try {
    const { id } = await params;

    const product = await prisma.product.findUnique({
      where: { id },
      select: { imageUrl: true },
    });

    if (!product) {
      return Response.json({ error: { message: "Product not found" } }, { status: 404 });
    }

    const data = await prisma.product.delete({
      where: { id },
      include: { category: true, inventory: true },
    });

    await removeProductImageAsset(product.imageUrl);

    invalidateAdminProductsCaches();
    return Response.json({ data }, { status: 200 });
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2003"
    ) {
      return Response.json(
        {
          error: {
            message:
              "Produk tidak bisa dihapus karena sudah dipakai pada transaksi/riwayat stok.",
          },
        },
        { status: 409 }
      );
    }

    return toHttpResponse(err);
  }
}

export async function adminUploadProductImageHandler(req, { params }) {
  try {
    const { id } = await params;

    const product = await prisma.product.findUnique({
      where: { id },
      select: { id: true, imageUrl: true },
    });

    if (!product) {
      return Response.json({ error: { message: "Product not found" } }, { status: 404 });
    }

    const formData = await req.formData();
    const file = formData.get("file");

    const optimized = await optimizeImageUpload({
      file,
      baseName: id,
      maxBytes: 2 * 1024 * 1024,
      allowSvg: false,
      resize: { width: 1280, height: 1280 },
      quality: 78,
    });
    if (optimized.error) {
      return Response.json(
        { error: { message: optimized.error.message } },
        { status: optimized.error.status }
      );
    }

    let imageUrl = "";
    if (isSupabaseStorageEnabled()) {
      const uploaded = await uploadBufferToSupabase({
        objectPath: `products/${optimized.filename}`,
        buffer: optimized.buffer,
        contentType: optimized.mime || "image/webp",
        upsert: true,
      });
      imageUrl = uploaded.publicUrl;
    } else {
      const uploadsDir = path.join(process.cwd(), "public", "uploads", "products");
      await fs.mkdir(uploadsDir, { recursive: true });
      const filePath = path.join(uploadsDir, optimized.filename);
      await fs.writeFile(filePath, optimized.buffer);
      imageUrl = `/uploads/products/${optimized.publicPath}`;
    }

    await removeProductImageAsset(product.imageUrl);

    const data = await prisma.product.update({
      where: { id },
      data: { imageUrl },
      include: { category: true, inventory: true },
    });

    invalidateAdminProductsCaches();
    return Response.json({ data }, { status: 200 });
  } catch (err) {
    return toHttpResponse(err);
  }
}
