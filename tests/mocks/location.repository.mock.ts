import { vi } from "vitest";
import type { LocationRepository } from "@/features/locations/ports/location.repository";

export function createLocationRepositoryMock() {
  return {
    findMany: vi.fn<LocationRepository["findMany"]>(),
    findById: vi.fn<LocationRepository["findById"]>(),
    create: vi.fn<LocationRepository["create"]>(),
    update: vi.fn<LocationRepository["update"]>(),
    delete: vi.fn<LocationRepository["delete"]>(),
  } satisfies LocationRepository;
}
