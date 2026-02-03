import { prisma } from "@/data/prisma/client";
import { requireRole } from "@/domain/auth/auth.service";
import { toHttpResponse } from "@/lib/errors/toHttpResponse";

export async function GET(req, { params }) {
  try {
    await requireRole(["ADMIN"]);

    const { id } = await params;  // ✅ Destructure
    const data = await prisma.product.findUnique({
      where: { id },
      include: { category: true, inventory: true },
    });

    return Response.json({ data }, { status: 200 });
  } catch (err) {
    return toHttpResponse(err);
  }
}

export async function PUT(req, { params }) {
  try {
    await requireRole(["ADMIN"]);

    const { id } = await params;  // ✅ Destructure
    const body = await req.json();

    const payload = {
      name: (body?.name || "").trim(),
      sku: (body?.sku || "").trim() || null,
      barcode: (body?.barcode || "").trim() || null,
      price: Number(body?.price || 0),
      cost: Number(body?.cost || 0),
      isActive: body?.isActive !== false,
      categoryId: body?.categoryId || null,
      qtyOnHand: Number(body?.qtyOnHand || 0),
    };

    if (!payload.name) {
      return Response.json({ error: { message: "name is required" } }, { status: 400 });
    }

    const data = await prisma.product.update({
      where: { id },
      data: {
        name: payload.name,
        sku: payload.sku,
        barcode: payload.barcode,
        price: payload.price,
        cost: payload.cost,
        isActive: payload.isActive,
        categoryId: payload.categoryId,
        inventory: {
          upsert: {
            create: { qtyOnHand: payload.qtyOnHand },
            update: { qtyOnHand: payload.qtyOnHand },
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

export async function PATCH(req, { params }) {
  try {
    await requireRole(["ADMIN"]);

    const { id } = await params;
    const body = await req.json();

    // hanya update field yang dikirim
    const dataUpdate = {};

    if ("isActive" in body) {
      dataUpdate.isActive = body.isActive;
    }

    // inventory hanya kalau qtyOnHand dikirim
    if ("qtyOnHand" in body) {
      const qty = Number(body.qtyOnHand || 0);

      dataUpdate.inventory = {
        upsert: {
          create: { qtyOnHand: qty },
          update: { qtyOnHand: qty },
        },
      };
    }

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


export async function DELETE(req, { params }) {
  try {
    await requireRole(["ADMIN"]);

    const { id } = await params;  // ✅ Destructure

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