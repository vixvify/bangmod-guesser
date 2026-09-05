import type { UploadImageInput } from "../schema/image.schema";

export interface ImageRepository {
  upload(key: string, image: UploadImageInput): Promise<void>;
  delete(key: string): Promise<void>;
  getPublicUrl(key: string): string;
}
