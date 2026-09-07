import { prisma } from "@/lib/prisma";
import type { SessionRepository } from "@/core/ports/session.repository";

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

  async findUserByToken(token: string) {
    const session = await prisma.session.findFirst({
      where: {
        token,
        expiresAt: {
          gt: new Date(),
        },
      },
      include: { user: true },
    });

    return session?.user ?? null;
  }

  async deleteByToken(token: string): Promise<void> {
    await prisma.session.deleteMany({
      where: { token },
    });
  }
}
