import { vi } from "vitest";
import type { LocationRepository } from "@/core/ports/location.repository";

export function createLocationRepositoryMock() {
  return {
    findMany: vi.fn<LocationRepository["findMany"]>(),
    findById: vi.fn<LocationRepository["findById"]>(),
    create: vi.fn<LocationRepository["create"]>(),
    update: vi.fn<LocationRepository["update"]>(),
    delete: vi.fn<LocationRepository["delete"]>(),
    updateImage: vi.fn<LocationRepository["updateImage"]>(),
    deleteImages: vi.fn<LocationRepository["deleteImages"]>(),
    setLocationImages: vi.fn<LocationRepository["setLocationImages"]>(),
  } satisfies LocationRepository;
}
