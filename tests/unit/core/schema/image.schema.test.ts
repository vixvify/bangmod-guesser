import { describe, expect, it } from "vitest";

import { IMAGE_MAX_SIZE_BYTES } from "@/core/constants/image";
import {
  CreateLocationImagesSchema,
  DeleteImageSchema,
  LocationImageRecordSchema,
  UpdateLocationImagesSchema,
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

describe("location image schemas", () => {
  const image = { contentType: "image/png", content: pngContent };

  it("requires one to five images on creation", () => {
    expect(CreateLocationImagesSchema.safeParse([]).success).toBe(false);
    expect(CreateLocationImagesSchema.safeParse([image]).success).toBe(true);
    expect(CreateLocationImagesSchema.safeParse(Array(6).fill(image)).success).toBe(false);
  });

  it("parses retained image numbers separately from location fields", () => {
    expect(UpdateLocationImagesSchema.parse({ keepImageNumbers: ["3", "1"] })).toEqual({
      keepImageNumbers: [3, 1],
    });
  });

  it("validates the numbered URL saved in a location record", () => {
    expect(LocationImageRecordSchema.parse({ imageNumber: 1, imageUrl: "https://example.com/1.jpg" })).toEqual({
      imageNumber: 1,
      imageUrl: "https://example.com/1.jpg",
    });
    expect(LocationImageRecordSchema.safeParse({ imageNumber: 1, imageUrl: "not-a-url" }).success).toBe(false);
  });
});

describe("DeleteImageSchema", () => {
  it("rejects a key outside the image namespace", () => {
    expect(DeleteImageSchema.safeParse({ key: "private/file.png" }).success).toBe(
      false,
    );
  });
});
