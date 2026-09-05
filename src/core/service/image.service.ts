import { randomUUID } from "node:crypto";

import { IMAGE_EXTENSIONS, IMAGE_KEY_PREFIX } from "../constants/image";
import type { Image } from "../domain/image";
import type { ImageRepository } from "../ports/image.repository";
import {
  type DeleteImageInput,
  type UploadImageInput,
} from "../schema/image.schema";

export class ImageService {
  constructor(private readonly imageRepository: ImageRepository) {}

  async upload(input: UploadImageInput): Promise<Image> {
    const key = `${IMAGE_KEY_PREFIX}${randomUUID()}.${IMAGE_EXTENSIONS[input.contentType]}`;

    await this.imageRepository.upload(key, input);

    return {
      key,
      url: this.imageRepository.getPublicUrl(key),
    };
  }

  async delete(input: DeleteImageInput): Promise<void> {
    await this.imageRepository.delete(input.key);
  }
}
