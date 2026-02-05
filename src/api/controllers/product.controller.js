import { prisma } from "@/data/prisma/client";
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
    const { limit } = parseGetAllProductsQuery(req);

    const data = await getAllProducts({ limit });

    return Response.json({ data }, { status: 200 });
  } catch (err) {
    return toHttpResponse(err);
  }
}

export async function getProductsByCategoryHandler(req) {
  try {
    const { categoryId, limit } = parseGetProductsByCategoryQuery(req);

    const data = await getProductsByCategory({ categoryId, limit });

    return Response.json({ data }, { status: 200 });
  } catch (err) {
    return toHttpResponse(err);
  }
}

export async function searchProductsHandler(req) {
  try {
    const { q, limit, categoryId } = parseSearchProductsQuery(req);

    const data = await searchProducts({ q, limit, categoryId });

    return Response.json({ data }, { status: 200 });
  } catch (err) {
    return toHttpResponse(err);
  }
}

export async function adminSearchProductsHandler(req) {
  try {
    const { q, limit } = parseAdminSearchProductsQuery(req);

    const data = await searchProducts({ q, limit });

    return Response.json({ data }, { status: 200 });
  } catch (err) {
    return toHttpResponse(err);
  }
}

export async function adminListProductsHandler(req) {
  try {
    const { q, take, skip } = parseAdminListProductsQuery(req);

    const where = q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { sku: { contains: q, mode: "insensitive" } },
            { barcode: { contains: q, mode: "insensitive" } },
          ],
        }
      : {};

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

    const data = await prisma.product.update({
      where: { id },
      data: { isActive: false },
      include: { category: true, inventory: true },
    });

    return Response.json({ data }, { status: 200 });
  } catch (err) {
    return toHttpResponse(err);
  }
}
