import { prisma } from "@/data/prisma/client";

export async function findUserByEmail(email) {
  return prisma.user.findUnique({ where: { email } });
}

export async function findUserById(id) {
  return prisma.user.findUnique({ where: { id } });
}

export async function updateUserById(id, data) {
  return prisma.user.update({ where: { id }, data });
}

export async function listUsers({ q = "", take = 50, skip = 0 } = {}) {
  const where = q
    ? {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { email: { contains: q, mode: "insensitive" } },
        ],
      }
    : {};

  const [items, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take,
      skip,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        mustChangePassword: true,
        createdAt: true,
      },
    }),
    prisma.user.count({ where }),
  ]);

  return { items, total, take, skip };
}
