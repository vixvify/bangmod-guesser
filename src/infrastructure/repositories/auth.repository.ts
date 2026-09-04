import { prisma } from "@/lib/prisma";
import type { AuthRepository } from "@/core/ports/auth.repository";
import type { CreateUserInput } from "@/core/schema/auth.schema";

export class AuthRepositoryImpl implements AuthRepository {
  async create(data: CreateUserInput) {
    return prisma.user.create({
      data,
      include: { role: true },
    });
  }

  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
      include: { role: true },
    });
  }

  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: { role: true },
    });
  }
}
