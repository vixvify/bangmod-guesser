import type { User } from "../domain/user";

export interface SessionRepository {
  create(userId: string, token: string, expiresAt: Date): Promise<void>;
  findUserByToken(token: string): Promise<User | null>;
  deleteByToken(token: string): Promise<void>;
}
