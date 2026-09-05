import { describe, expect, it } from "vitest";

import { ImageService } from "@/core/service/image.service";
import { createImageRepositoryMock } from "../../../mocks/image.repository.mock";

const pngContent = new Uint8Array([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
]);

describe("ImageService", () => {
  it("uploads an image and returns its generated key and public URL", async () => {
    const repository = createImageRepositoryMock();
    repository.getPublicUrl.mockImplementation(
      (key) => `https://images.example.com/${key}`,
    );
    const service = new ImageService(repository);

    const image = await service.upload({
      contentType: "image/png",
      content: pngContent,
    });

    expect(image).toMatchObject({
      key: expect.stringMatching(/^images\/[a-f0-9-]+\.png$/),
      url: expect.stringMatching(/^https:\/\/images\.example\.com\/images\//),
    });
    expect(repository.upload).toHaveBeenCalledWith(image.key, {
      contentType: "image/png",
      content: pngContent,
    });
  });

  it("deletes an image through the repository", async () => {
    const repository = createImageRepositoryMock();
    const service = new ImageService(repository);

    await service.delete({
      key: "images/21caef87-af96-4e68-9d5e-d68f7508117a.png",
    });

    expect(repository.delete).toHaveBeenCalledWith(
      "images/21caef87-af96-4e68-9d5e-d68f7508117a.png",
    );
  });
});
