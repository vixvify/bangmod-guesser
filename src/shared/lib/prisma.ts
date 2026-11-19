import { PrismaClient } from "@prisma/client";
import { config } from "@/shared/config/runtime";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  datasourceUrl: config.databaseUrl,
});

if (!config.isProduction) {
  globalForPrisma.prisma = prisma;
}
