const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();
const isProduction = process.env.NODE_ENV === "production";

function requiredEnv(name) {
  const value = String(process.env[name] || "").trim();
  return value || null;
}

async function upsertUser({ name, email, role, password, mustChangePassword = false }) {
  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.upsert({
    where: { email },
    update: {
      name,
      role,
      passwordHash,
      mustChangePassword,
    },
    create: {
      name,
      email,
      role,
      passwordHash,
      mustChangePassword,
    },
  });
}

async function main() {
  console.log("Seeding database...");

  // 1) Users
  if (isProduction) {
    const ownerName = requiredEnv("BOOTSTRAP_OWNER_NAME");
    const ownerEmail = requiredEnv("BOOTSTRAP_OWNER_EMAIL");
    const ownerPassword = requiredEnv("BOOTSTRAP_OWNER_PASSWORD");

    if (ownerName && ownerEmail && ownerPassword) {
      await upsertUser({
        name: ownerName,
        email: ownerEmail.toLowerCase(),
        role: "OWNER",
        password: ownerPassword,
        mustChangePassword: true,
      });
      console.log("Bootstrap owner upserted for production.");
    } else {
      console.log(
        "Production mode detected: skip default user seed. " +
          "Set BOOTSTRAP_OWNER_NAME/EMAIL/PASSWORD to create initial owner."
      );
    }
  } else {
    const adminName = requiredEnv("DEV_SEED_OWNER_NAME") || "Admin";
    const adminEmail = (requiredEnv("DEV_SEED_OWNER_EMAIL") || "owner@local.test").toLowerCase();
    const adminPassword = requiredEnv("DEV_SEED_OWNER_PASSWORD") || "password123";

    const cashierName = requiredEnv("DEV_SEED_CASHIER_NAME") || "Cashier";
    const cashierEmail =
      (requiredEnv("DEV_SEED_CASHIER_EMAIL") || "cashier@local.test").toLowerCase();
    const cashierPassword = requiredEnv("DEV_SEED_CASHIER_PASSWORD") || "password123";

    await upsertUser({
      name: adminName,
      email: adminEmail,
      role: "OWNER",
      password: adminPassword,
      mustChangePassword: false,
    });

    await upsertUser({
      name: cashierName,
      email: cashierEmail,
      role: "CASHIER",
      password: cashierPassword,
      mustChangePassword: false,
    });
  }

  // 2) Category
  const category = await prisma.category.upsert({
    where: { name: "Minuman" },
    update: {},
    create: { name: "Minuman" },
  });

  // 3) Product + Inventory
  const product = await prisma.product.upsert({
    where: { barcode: "899000000001" },
    update: {},
    create: {
      name: "Teh Botol",
      barcode: "899000000001",
      sku: "TB-01",
      price: 5000,
      cost: 3500,
      isActive: true,
      categoryId: category.id,
      inventory: {
        create: {
          qtyOnHand: 100,
        },
      },
    },
  });

  await prisma.receiptTemplate.upsert({
    where: { id: "default" },
    update: {
      storeName: "Toko Maju Terus",
      storeAddress: "Jalan Raya Serpong, RT99/99 NO. 16",
      storePhone: "08123456789",
      footerText: "Terima kasih atas kunjungan Anda",
      logoUrl:
        "https://www.designmantic.com/logo-images/166557.png?company=Company%20Name&keyword=retail&slogan=&verify=1",
    },
    create: {
      id: "default",
      storeName: "Toko Maju Terus",
      storeAddress: "Jalan Raya Serpong, RT99/99 NO. 16",
      storePhone: "08123456789",
      footerText: "Terima kasih atas kunjungan Anda",
      logoUrl:
        "https://www.designmantic.com/logo-images/166557.png?company=Company%20Name&keyword=retail&slogan=&verify=1",
    },
  });

  console.log("Seed complete.");
  console.log({
    env: isProduction ? "production" : "development",
    productId: product.id,
    receiptTemplateId: "default",
  });
}

main()
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
