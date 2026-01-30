import { prisma } from "@/data/prisma/client";

export async function findUserByEmail(email) {
  return prisma.user.findUnique({ where: { email } });
}
