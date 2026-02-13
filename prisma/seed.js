const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // 1) Users
  const adminEmail = "damee@png.id";
  const cashierEmail = "cashier@local.test";

  // default password untuk local dev
  const adminPassword = "password123";
  const cashierPassword = "password123";

  const adminHash = await bcrypt.hash(adminPassword, 10);
  const cashierHash = await bcrypt.hash(cashierPassword, 10);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      // pastikan kalau user sudah ada, hash tetap sinkron (dev friendly)
      passwordHash: adminHash,
      role: "OWNER",
      name: "Admin",
    },
    create: {
      name: "Admin",
      email: adminEmail,
      role: "OWNER",
      passwordHash: adminHash,
    },
  });

  await prisma.user.upsert({
    where: { email: cashierEmail },
    update: {
      passwordHash: cashierHash,
      role: "CASHIER",
      name: "Cashier",
    },
    create: {
      name: "Cashier",
      email: cashierEmail,
      role: "CASHIER",
      passwordHash: cashierHash,
    },
  });

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
    adminEmail,
    adminPassword,
    cashierEmail,
    cashierPassword,
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
