import { IMAGE_CONTENT_TYPES } from "@/core/constants/image";

type ImageContentType = (typeof IMAGE_CONTENT_TYPES)[number];

function hasPrefix(content: Uint8Array, prefix: readonly number[]) {
  return prefix.every((byte, index) => content[index] === byte);
}

export function hasValidImageSignature(
  contentType: ImageContentType,
  content: Uint8Array,
) {
  if (contentType === "image/jpeg") {
    return hasPrefix(content, [0xff, 0xd8, 0xff]);
  }

  if (contentType === "image/png") {
    return hasPrefix(content, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  }

  return (
    hasPrefix(content, [0x52, 0x49, 0x46, 0x46]) &&
    hasPrefix(content.slice(8), [0x57, 0x45, 0x42, 0x50])
  );
}
