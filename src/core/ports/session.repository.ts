import type { UserModel } from "../../../prisma/types/user";

export interface SessionRepository {
  create(userId: string, token: string, expiresAt: Date): Promise<void>;
  findUserByToken(token: string): Promise<UserModel | null>;
  deleteByToken(token: string): Promise<void>;
}
