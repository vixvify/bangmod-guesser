import { vi } from "vitest";

import type { ImageRepository } from "@/features/images/server/image.repository.port";

export function createImageRepositoryMock() {
  return {
    upload: vi.fn<ImageRepository["upload"]>(),
    delete: vi.fn<ImageRepository["delete"]>(),
    getPublicUrl: vi.fn<ImageRepository["getPublicUrl"]>(),
  } satisfies ImageRepository;
}
