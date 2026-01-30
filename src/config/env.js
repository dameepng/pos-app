export const env = {
  DATABASE_URL: process.env.DATABASE_URL,

  DEV_CASHIER_ID: process.env.DEV_CASHIER_ID,

  MIDTRANS_SERVER_KEY: process.env.MIDTRANS_SERVER_KEY,
  MIDTRANS_CLIENT_KEY: process.env.MIDTRANS_CLIENT_KEY,
  MIDTRANS_IS_PRODUCTION: process.env.MIDTRANS_IS_PRODUCTION === "true",

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
}
