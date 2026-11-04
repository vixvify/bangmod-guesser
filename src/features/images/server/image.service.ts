import { randomUUID } from "node:crypto";

import { IMAGE_EXTENSIONS, IMAGE_KEY_PREFIX } from "../image.constants";
import type { Image } from "../image";
import type { ImageRepository } from "./image.repository.port";
import {
  type DeleteImageInput,
  type UploadImageInput,
} from "../image.schema";

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
