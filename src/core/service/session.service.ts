import { randomBytes } from "node:crypto";
import type { User } from "../domain/user";
import type { SessionRepository } from "../ports/session.repository";
import { SESSION_DURATION_SECONDS } from "@/core/constants/auth";

export class SessionService {
  constructor(private readonly sessionRepository: SessionRepository) {}

  async create(userId: string): Promise<string> {
    const token = randomBytes(32).toString("base64url");
    const expiresAt = new Date(Date.now() + SESSION_DURATION_SECONDS * 1000);

    await this.sessionRepository.create(userId, token, expiresAt);

    return token;
  }

  async getCurrentUser(token: string | null): Promise<User | null> {
    if (!token) {
      return null;
    }

    return this.sessionRepository.findUserByToken(token);
  }

  async delete(token: string | null): Promise<void> {
    if (token) {
      await this.sessionRepository.deleteByToken(token);
    }
  }
}
