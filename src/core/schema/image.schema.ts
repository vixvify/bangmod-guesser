import { z } from "zod";

import {
  IMAGE_CONTENT_TYPES,
  IMAGE_KEY_PREFIX,
  IMAGE_MAX_SIZE_BYTES,
  IMAGE_MESSAGES,
} from "../constants/image";
import { hasValidImageSignature } from "@/lib/image-signature";

const ImageContentTypeSchema = z.enum(IMAGE_CONTENT_TYPES);

export const UploadImageSchema = z
  .object({
    contentType: ImageContentTypeSchema,
    content: z
      .instanceof(Uint8Array)
      .refine((content) => content.byteLength > 0, IMAGE_MESSAGES.invalidFile)
      .refine(
        (content) => content.byteLength <= IMAGE_MAX_SIZE_BYTES,
        IMAGE_MESSAGES.tooLarge,
      ),
  })
  .superRefine((image, context) => {
    if (!hasValidImageSignature(image.contentType, image.content)) {
      context.addIssue({
        code: "custom",
        message: IMAGE_MESSAGES.invalidFile,
        path: ["content"],
      });
    }
  });

export const DeleteImageSchema = z.object({
  key: z
    .string()
    .trim()
    .min(1, IMAGE_MESSAGES.invalidKey)
    .startsWith(IMAGE_KEY_PREFIX, IMAGE_MESSAGES.invalidKey)
    .regex(/^images\/[a-f0-9-]+\.(jpg|png|webp)$/, IMAGE_MESSAGES.invalidKey),
});

export type ImageContentType = z.infer<typeof ImageContentTypeSchema>;
export type UploadImageInput = z.infer<typeof UploadImageSchema>;
export type DeleteImageInput = z.infer<typeof DeleteImageSchema>;
