import { prisma } from "@/lib/prisma";
import type { AuthRepository } from "@/core/ports/auth.repository";
import type { CreateUserInput } from "@/core/schema/auth.schema";
import type { User } from "@/core/domain/user";

export class AuthRepositoryImpl implements AuthRepository {
  async create(data: CreateUserInput): Promise<User> {
    return prisma.user.create({
      data,
      select: {
        id: true,
        name: true,
        email: true,
      },
    });
  }

  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
      },
    });
  }

  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });
  }
}
