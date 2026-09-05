import { describe, expect, it } from "vitest";

import { IMAGE_MAX_SIZE_BYTES } from "@/core/constants/image";
import {
  DeleteImageSchema,
  UploadImageSchema,
} from "@/core/schema/image.schema";

const pngContent = new Uint8Array([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
]);

describe("UploadImageSchema", () => {
  it("rejects an unsupported image type", () => {
    expect(
      UploadImageSchema.safeParse({
        contentType: "image/gif",
        content: pngContent,
      }).success,
    ).toBe(false);
  });

  it("rejects an image that exceeds the maximum size", () => {
    const content = new Uint8Array(IMAGE_MAX_SIZE_BYTES + 1);
    content.set(pngContent);

    const result = UploadImageSchema.safeParse({
      contentType: "image/png",
      content,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(
        "Image must not exceed 5 MB",
      );
    }
  });
});

describe("DeleteImageSchema", () => {
  it("rejects a key outside the image namespace", () => {
    expect(DeleteImageSchema.safeParse({ key: "private/file.png" }).success).toBe(
      false,
    );
  });
});
