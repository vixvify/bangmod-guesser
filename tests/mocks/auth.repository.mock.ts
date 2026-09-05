import { vi } from "vitest";
import type { AuthRepository } from "@/core/ports/auth.repository";

export function createAuthRepositoryMock() {
  return {
    create: vi.fn<AuthRepository["create"]>(),
    findByEmail: vi.fn<AuthRepository["findByEmail"]>(),
    findById: vi.fn<AuthRepository["findById"]>(),
  } satisfies AuthRepository;
}
