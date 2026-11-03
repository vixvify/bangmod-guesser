import { vi } from "vitest";

import type { ImageRepository } from "@/features/images/ports/image.repository";

export function createImageRepositoryMock() {
  return {
    upload: vi.fn<ImageRepository["upload"]>(),
    delete: vi.fn<ImageRepository["delete"]>(),
    getPublicUrl: vi.fn<ImageRepository["getPublicUrl"]>(),
  } satisfies ImageRepository;
}
