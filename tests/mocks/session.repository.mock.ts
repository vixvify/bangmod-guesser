import { vi } from "vitest";
import type { SessionRepository } from "@/core/ports/session.repository";

export function createSessionRepositoryMock() {
  return {
    create: vi.fn<SessionRepository["create"]>(),
    findUserByToken: vi.fn<SessionRepository["findUserByToken"]>(),
    deleteByToken: vi.fn<SessionRepository["deleteByToken"]>(),
  } satisfies SessionRepository;
}
