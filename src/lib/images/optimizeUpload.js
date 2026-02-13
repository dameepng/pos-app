const SVG_MIME = "image/svg+xml";

function buildFileName(baseName) {
  return `${baseName}-${Date.now()}`;
}

export async function optimizeImageUpload({
  file,
  baseName,
  maxBytes = 2 * 1024 * 1024,
  allowSvg = false,
  resize = { width: 1280, height: 1280 },
  quality = 78,
}) {
  if (!file || typeof file.arrayBuffer !== "function") {
    return { error: { message: "Image file is required", status: 400 } };
  }

  if (file.size > maxBytes) {
    return { error: { message: "Image too large (max 2MB)", status: 413 } };
  }

  const supportedMimes = new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/avif",
    ...(allowSvg ? [SVG_MIME] : []),
  ]);

  if (!supportedMimes.has(file.type)) {
    return { error: { message: "Unsupported image type", status: 415 } };
  }

  const rawBuffer = Buffer.from(await file.arrayBuffer());
  const baseFile = buildFileName(baseName);

  if (allowSvg && file.type === SVG_MIME) {
    return {
      buffer: rawBuffer,
      filename: `${baseFile}.svg`,
      publicPath: `${baseFile}.svg`,
      mime: SVG_MIME,
      optimized: false,
    };
  }

  let sharpModule = null;
  try {
    const imported = await import("sharp");
    sharpModule = imported?.default || imported;
  } catch {
    sharpModule = null;
  }

  if (!sharpModule) {
    const extByMime = {
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/webp": "webp",
      "image/avif": "avif",
    };
    const fallbackExt = extByMime[file.type] || "jpg";
    return {
      buffer: rawBuffer,
      filename: `${baseFile}.${fallbackExt}`,
      publicPath: `${baseFile}.${fallbackExt}`,
      mime: file.type,
      optimized: false,
    };
  }

  const optimizedBuffer = await sharpModule(rawBuffer, { failOn: "none" })
    .rotate()
    .resize({
      width: resize.width,
      height: resize.height,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality, effort: 4 })
    .toBuffer();

  return {
    buffer: optimizedBuffer,
    filename: `${baseFile}.webp`,
    publicPath: `${baseFile}.webp`,
    mime: "image/webp",
    optimized: true,
  };
}
