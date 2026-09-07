import { prisma } from "@/lib/prisma";
import type { AuthRepository } from "@/core/ports/auth.repository";
import type { CreateUserInput } from "@/core/schema/auth.schema";

export class AuthRepositoryImpl implements AuthRepository {
  async create(data: CreateUserInput) {
    return prisma.user.create({ data });
  }

  async findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  }

  async findById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  }
}
