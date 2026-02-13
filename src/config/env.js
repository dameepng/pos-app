export const env = {
  DATABASE_URL: process.env.DATABASE_URL,

  DEV_CASHIER_ID: process.env.DEV_CASHIER_ID,

  MIDTRANS_SERVER_KEY: process.env.MIDTRANS_SERVER_KEY,
  MIDTRANS_CLIENT_KEY: process.env.MIDTRANS_CLIENT_KEY,
  MIDTRANS_IS_PRODUCTION: process.env.MIDTRANS_IS_PRODUCTION === "true",

  SUPABASE_URL: process.env.SUPABASE_URL || "",
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
  SUPABASE_STORAGE_BUCKET: process.env.SUPABASE_STORAGE_BUCKET || "",

  AUTH_JWT_SECRET: process.env.AUTH_JWT_SECRET || "",
  AUTH_COOKIE_NAME: process.env.AUTH_COOKIE_NAME || "pos_session",
};

export function validateEnv() {
  if (!env.DATABASE_URL) {
    throw new Error("Missing DATABASE_URL in environment");
  }

  if (!env.MIDTRANS_SERVER_KEY) {
    console.warn("MIDTRANS_SERVER_KEY not set yet (QRIS won't work)");
    console.log("MIDTRANS_IS_PRODUCTION", env.MIDTRANS_IS_PRODUCTION);
    console.log("MIDTRANS_SERVER_KEY prefix", (env.MIDTRANS_SERVER_KEY || "").slice(0, 12));
  }

  const storageConfigured =
    env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY && env.SUPABASE_STORAGE_BUCKET;
  if (!storageConfigured) {
    console.warn(
      "Supabase Storage env is incomplete; upload will fallback to local filesystem."
    );
  }
}
