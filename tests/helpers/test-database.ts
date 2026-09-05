import { prisma } from "@/lib/prisma";

export async function resetTestDatabase() {
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();

  await prisma.role.upsert({
    where: { id: "role_user" },
    create: { id: "role_user", name: "USER" },
    update: { name: "USER" },
  });
}

export async function disconnectTestDatabase() {
  await prisma.$disconnect();
}
