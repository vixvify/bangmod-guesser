import { Prisma, PrismaClient, Role, UserStatus } from "@prisma/client";

export async function seedInitialAdmin(
  database: PrismaClient,
  email: string,
): Promise<"promoted" | "already-admin"> {
  return database.$transaction(
    async (transaction) => {
      const user = await transaction.user.findUnique({
        where: { email },
        select: { id: true, role: true, banned: true, status: true },
      });

      if (!user) {
        throw new Error(
          "Admin account not found. Register this email before running the seed.",
        );
      }

      if (user.role === Role.ADMIN) {
        return "already-admin";
      }

      if (user.banned || user.status !== UserStatus.ACTIVE) {
        throw new Error(
          "A banned or suspended account cannot become the initial admin.",
        );
      }

      const existingAdmin = await transaction.user.findFirst({
        where: { role: Role.ADMIN },
        select: { id: true },
      });

      if (existingAdmin) {
        throw new Error(
          "An admin already exists. Use the authenticated admin role flow instead.",
        );
      }

      await transaction.user.update({
        where: { id: user.id },
        data: { role: Role.ADMIN },
      });

      return "promoted";
    },
    { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
  );
}
