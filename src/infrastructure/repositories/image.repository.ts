import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";

import type { ImageRepository } from "@/core/ports/image.repository";
import type { UploadImageInput } from "@/core/schema/image.schema";
import { getR2Client, getR2Config } from "@/lib/r2";

export class ImageRepositoryImpl implements ImageRepository {
  async upload(key: string, image: UploadImageInput): Promise<void> {
    const config = getR2Config();

    await getR2Client(config).send(
      new PutObjectCommand({
        Bucket: config.R2_BUCKET_NAME,
        Key: key,
        Body: image.content,
        ContentType: image.contentType,
      }),
    );
  }

  async delete(key: string): Promise<void> {
    const config = getR2Config();

    await getR2Client(config).send(
      new DeleteObjectCommand({
        Bucket: config.R2_BUCKET_NAME,
        Key: key,
      }),
    );
  }

  getPublicUrl(key: string): string {
    const { R2_PUBLIC_URL } = getR2Config();
    const publicUrl = R2_PUBLIC_URL.endsWith("/")
      ? R2_PUBLIC_URL
      : `${R2_PUBLIC_URL}/`;

    return new URL(key, publicUrl).toString();
  }
}
