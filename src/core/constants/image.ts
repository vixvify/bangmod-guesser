export const IMAGE_CONTENT_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export const IMAGE_MAX_SIZE_BYTES = 5 * 1024 * 1024;
export const IMAGE_KEY_PREFIX = "images/";

export const IMAGE_EXTENSIONS = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
} as const;

export const IMAGE_MESSAGES = {
  fileRequired: "Image file is required",
  invalidFile: "Invalid image file",
  invalidType: "Only JPEG, PNG, and WebP images are allowed",
  tooLarge: "Image must not exceed 5 MB",
  invalidKey: "Invalid image key",
  storageNotConfigured: "Image storage is not configured",
} as const;
