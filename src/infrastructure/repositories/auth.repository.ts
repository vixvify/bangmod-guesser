import { prisma } from "@/lib/prisma";
import type { AuthRepository } from "@/core/ports/auth.repository";
import type { CreateUserInput } from "@/core/schema/auth.schema";
import type { User } from "@/core/domain/user";
import { UserFactory } from "@/factories/user.factory";

export class AuthRepositoryImpl implements AuthRepository {
  async create(data: CreateUserInput): Promise<User> {
    const user = await prisma.user.create({
      data: {
        ...data,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: {
          select: {
            name: true,
          },
        },
      },
    });

    return UserFactory.fromRecord(user);
  }

  async findByEmail(email: string) {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
        role: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!user) {
      return null;
    }

    return UserFactory.withPassword(user);
  }

  async findById(id: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!user) {
      return null;
    }

    return UserFactory.fromRecord(user);
  }
}
