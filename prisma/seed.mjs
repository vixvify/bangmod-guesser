import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

await prisma.role.upsert({
  where: { id: "role_user" },
  create: { id: "role_user", name: "USER" },
  update: { name: "USER" },
});

await prisma.role.upsert({
  where: { id: "role_admin" },
  create: { id: "role_admin", name: "ADMIN" },
  update: { name: "ADMIN" },
});

await prisma.$disconnect();
