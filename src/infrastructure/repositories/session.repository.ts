import { prisma } from "@/lib/prisma";
import type { SessionRepository } from "@/core/ports/session.repository";
import type { User } from "@/core/domain/user";
import { UserFactory } from "@/factories/user.factory";

export class SessionRepositoryImpl implements SessionRepository {
  async create(userId: string, token: string, expiresAt: Date): Promise<void> {
    await prisma.session.create({
      data: {
        userId,
        token,
        expiresAt,
      },
    });
  }

  async findUserByToken(token: string): Promise<User | null> {
    const session = await prisma.session.findFirst({
      where: {
        token,
        expiresAt: {
          gt: new Date(),
        },
      },
      select: {
        user: {
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
        },
      },
    });

    if (!session) {
      return null;
    }

    return UserFactory.fromRecord(session.user);
  }

  async deleteByToken(token: string): Promise<void> {
    await prisma.session.deleteMany({
      where: { token },
    });
  }
}
