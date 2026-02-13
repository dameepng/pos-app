import { prisma } from "@/data/prisma/client";
import { toHttpResponse } from "@/lib/errors/toHttpResponse";
import { promises as fs } from "fs";
import path from "path";
import { optimizeImageUpload } from "@/lib/images/optimizeUpload";
import {
  deleteFromSupabaseByPublicUrl,
  isSupabaseStorageEnabled,
  uploadBufferToSupabase,
} from "@/lib/storage/supabaseStorage";

const DEFAULT_TEMPLATE = {
  id: "default",
  storeName: "Toko Maju Terus",
  storeAddress: "Jalan Raya Serpong, RT99/99 NO. 16",
  storePhone: "08123456789",
  footerText: "Terima kasih atas kunjungan Anda",
  logoUrl:
    "https://www.designmantic.com/logo-images/166557.png?company=Company%20Name&keyword=retail&slogan=&verify=1",
};

function normalizeValue(value) {
  const text = String(value ?? "").trim();
  return text || null;
}

function getReceiptTemplateDelegate() {
  const delegate = prisma?.receiptTemplate;
  if (!delegate) {
    return null;
  }
  return delegate;
}

async function removeReceiptLogoAsset(logoUrl) {
  if (!logoUrl) return;

  if (logoUrl.startsWith("/uploads/receipt-logos/")) {
    const oldPath = path.join(process.cwd(), "public", logoUrl.replace(/^\/+/, ""));
    await fs.unlink(oldPath).catch(() => {});
    return;
  }

  await deleteFromSupabaseByPublicUrl(logoUrl).catch(() => {});
}

async function getOrCreateTemplate() {
  const delegate = getReceiptTemplateDelegate();
  if (!delegate) {
    return { ...DEFAULT_TEMPLATE, _needsPrismaGenerate: true };
  }

  const existing = await delegate.findUnique({
    where: { id: "default" },
  });

  if (existing) return existing;

  return delegate.create({
    data: DEFAULT_TEMPLATE,
  });
}

export async function getReceiptTemplateHandler() {
  try {
    const data = await getOrCreateTemplate();
    if (data?._needsPrismaGenerate) {
      return Response.json(
        {
          data: DEFAULT_TEMPLATE,
          warning:
            "Prisma client belum ter-generate untuk model ReceiptTemplate. Jalankan: npx prisma generate",
        },
        { status: 200 }
      );
    }
    return Response.json({ data }, { status: 200 });
  } catch (err) {
    return toHttpResponse(err);
  }
}

export async function updateReceiptTemplateHandler(req) {
  try {
    const delegate = getReceiptTemplateDelegate();
    if (!delegate) {
      return Response.json(
        {
          error: {
            message:
              "ReceiptTemplate belum tersedia di Prisma Client. Jalankan: npx prisma generate, lalu restart server.",
          },
        },
        { status: 503 }
      );
    }

    const body = await req.json();

    const data = await delegate.upsert({
      where: { id: "default" },
      update: {
        storeName: normalizeValue(body?.storeName),
        storeAddress: normalizeValue(body?.storeAddress),
        storePhone: normalizeValue(body?.storePhone),
        footerText: normalizeValue(body?.footerText),
        logoUrl: normalizeValue(body?.logoUrl),
      },
      create: {
        id: "default",
        storeName: normalizeValue(body?.storeName),
        storeAddress: normalizeValue(body?.storeAddress),
        storePhone: normalizeValue(body?.storePhone),
        footerText: normalizeValue(body?.footerText),
        logoUrl: normalizeValue(body?.logoUrl),
      },
    });

    return Response.json({ data }, { status: 200 });
  } catch (err) {
    return toHttpResponse(err);
  }
}

export async function uploadReceiptLogoHandler(req) {
  try {
    const delegate = getReceiptTemplateDelegate();
    if (!delegate) {
      return Response.json(
        {
          error: {
            message:
              "ReceiptTemplate belum tersedia di Prisma Client. Jalankan: npx prisma generate, lalu restart server.",
          },
        },
        { status: 503 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file");
    const template = await delegate.upsert({
      where: { id: "default" },
      update: {},
      create: { ...DEFAULT_TEMPLATE },
    });

    const optimized = await optimizeImageUpload({
      file,
      baseName: template.id,
      maxBytes: 2 * 1024 * 1024,
      allowSvg: true,
      resize: { width: 1024, height: 1024 },
      quality: 80,
    });
    if (optimized.error) {
      const localizedMessage =
        optimized.error.status === 400
          ? "File logo wajib diisi"
          : optimized.error.status === 413
            ? "Ukuran logo maksimal 2MB"
            : "Format logo tidak didukung";
      return Response.json(
        { error: { message: localizedMessage } },
        { status: optimized.error.status }
      );
    }

    let logoUrl = "";
    if (isSupabaseStorageEnabled()) {
      const uploaded = await uploadBufferToSupabase({
        objectPath: `receipt-logos/${optimized.filename}`,
        buffer: optimized.buffer,
        contentType: optimized.mime || "image/webp",
        upsert: true,
      });
      logoUrl = uploaded.publicUrl;
    } else {
      const uploadsDir = path.join(
        process.cwd(),
        "public",
        "uploads",
        "receipt-logos"
      );
      await fs.mkdir(uploadsDir, { recursive: true });

      const filePath = path.join(uploadsDir, optimized.filename);
      await fs.writeFile(filePath, optimized.buffer);
      logoUrl = `/uploads/receipt-logos/${optimized.publicPath}`;
    }

    await removeReceiptLogoAsset(template.logoUrl);

    const data = await delegate.update({
      where: { id: "default" },
      data: { logoUrl },
    });

    return Response.json({ data }, { status: 200 });
  } catch (err) {
    return toHttpResponse(err);
  }
}
