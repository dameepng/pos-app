function encodeObjectPath(objectPath) {
  return String(objectPath)
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");
}

function normalizeBaseUrl(url) {
  return String(url || "").replace(/\/+$/, "");
}

function getConfig() {
  const supabaseUrl = normalizeBaseUrl(process.env.SUPABASE_URL);
  const serviceRoleKey = String(process.env.SUPABASE_SERVICE_ROLE_KEY || "");
  const bucket = String(process.env.SUPABASE_STORAGE_BUCKET || "");

  return { supabaseUrl, serviceRoleKey, bucket };
}

export function isSupabaseStorageEnabled() {
  const { supabaseUrl, serviceRoleKey, bucket } = getConfig();
  return Boolean(supabaseUrl && serviceRoleKey && bucket);
}

export function buildSupabasePublicUrl(objectPath) {
  const { supabaseUrl, bucket } = getConfig();
  if (!supabaseUrl || !bucket) {
    throw new Error("Supabase Storage is not configured");
  }
  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${encodeObjectPath(objectPath)}`;
}

export async function uploadBufferToSupabase({
  objectPath,
  buffer,
  contentType = "application/octet-stream",
  upsert = true,
}) {
  const { supabaseUrl, serviceRoleKey, bucket } = getConfig();
  if (!supabaseUrl || !serviceRoleKey || !bucket) {
    throw new Error("Supabase Storage is not configured");
  }

  const encodedPath = encodeObjectPath(objectPath);
  const endpoint = `${supabaseUrl}/storage/v1/object/${bucket}/${encodedPath}`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      "Content-Type": contentType,
      "x-upsert": upsert ? "true" : "false",
    },
    body: buffer,
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Supabase upload failed (${response.status}): ${body || response.statusText}`);
  }

  return {
    objectPath,
    publicUrl: buildSupabasePublicUrl(objectPath),
  };
}

export async function deleteFromSupabaseByObjectPath(objectPath) {
  const { supabaseUrl, serviceRoleKey, bucket } = getConfig();
  if (!supabaseUrl || !serviceRoleKey || !bucket) {
    return false;
  }

  const encodedPath = encodeObjectPath(objectPath);
  const endpoint = `${supabaseUrl}/storage/v1/object/${bucket}/${encodedPath}`;
  const response = await fetch(endpoint, {
    method: "DELETE",
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
    },
  });

  if (response.status === 404) {
    return false;
  }

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Supabase delete failed (${response.status}): ${body || response.statusText}`);
  }

  return true;
}

export async function deleteFromSupabaseByPublicUrl(publicUrl) {
  const { supabaseUrl, bucket } = getConfig();
  if (!supabaseUrl || !bucket || !publicUrl) {
    return false;
  }

  let parsedUrl;
  try {
    parsedUrl = new URL(publicUrl);
  } catch {
    return false;
  }

  const expectedPrefix = `/storage/v1/object/public/${bucket}/`;
  if (!parsedUrl.pathname.startsWith(expectedPrefix)) {
    return false;
  }

  const rawPath = parsedUrl.pathname.slice(expectedPrefix.length);
  if (!rawPath) {
    return false;
  }

  const objectPath = decodeURIComponent(rawPath);
  return deleteFromSupabaseByObjectPath(objectPath);
}
