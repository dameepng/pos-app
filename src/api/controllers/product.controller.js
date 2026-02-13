import { prisma } from "@/data/prisma/client";
import { Prisma } from "@prisma/client";
import { promises as fs } from "fs";
import path from "path";
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
import { toHttpResponse } from "@/lib/errors/toHttpResponse";

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

    const where = {
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { sku: { contains: q, mode: "insensitive" } },
              { barcode: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
      ...(status
        ? { isActive: status === "active" }
        : {}),
      ...(categoryId ? { categoryId } : {}),
      ...(stock === "low"
        ? { inventory: { qtyOnHand: { lt: 5 } } }
        : {}),
    };

    const [items, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { category: true, inventory: true },
        orderBy: { createdAt: "desc" },
        take,
        skip,
      }),
      prisma.product.count({ where }),
    ]);

    return Response.json({ data: { items, total, take, skip } }, { status: 200 });
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

    if (product.imageUrl?.startsWith("/uploads/products/")) {
      const oldPath = path.join(process.cwd(), "public", product.imageUrl.replace(/^\/+/, ""));
      await fs.unlink(oldPath).catch(() => {});
    }

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

    if (!file || typeof file.arrayBuffer !== "function") {
      return Response.json(
        { error: { message: "Image file is required" } },
        { status: 400 }
      );
    }

    const maxBytes = 2 * 1024 * 1024;
    if (file.size > maxBytes) {
      return Response.json(
        { error: { message: "Image too large (max 2MB)" } },
        { status: 413 }
      );
    }

    const mimeToExt = new Map([
      ["image/jpeg", "jpg"],
      ["image/png", "png"],
      ["image/webp", "webp"],
      ["image/avif", "avif"],
    ]);
    const ext = mimeToExt.get(file.type);
    if (!ext) {
      return Response.json(
        { error: { message: "Unsupported image type" } },
        { status: 415 }
      );
    }

    const uploadsDir = path.join(process.cwd(), "public", "uploads", "products");
    await fs.mkdir(uploadsDir, { recursive: true });

    const filename = `${id}-${Date.now()}.${ext}`;
    const filePath = path.join(uploadsDir, filename);
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(filePath, buffer);

    const imageUrl = `/uploads/products/${filename}`;

    if (product.imageUrl?.startsWith("/uploads/products/")) {
      const oldPath = path.join(process.cwd(), "public", product.imageUrl.replace(/^\/+/, ""));
      await fs.unlink(oldPath).catch(() => {});
    }

    const data = await prisma.product.update({
      where: { id },
      data: { imageUrl },
      include: { category: true, inventory: true },
    });

    return Response.json({ data }, { status: 200 });
  } catch (err) {
    return toHttpResponse(err);
  }
}
