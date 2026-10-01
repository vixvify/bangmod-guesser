import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";

import { config } from "@/lib/config";
import type { ImageRepository } from "@/core/ports/image.repository";
import type { UploadImageInput } from "@/core/schema/image.schema";
import { getR2Client } from "@/lib/r2";

export class ImageRepositoryImpl implements ImageRepository {
  async upload(key: string, image: UploadImageInput): Promise<void> {
    const r2Config = config.r2;

    await getR2Client().send(
      new PutObjectCommand({
        Bucket: r2Config.bucketName,
        Key: key,
        Body: image.content,
        ContentType: image.contentType,
      }),
    );
  }

  async delete(key: string): Promise<void> {
    const r2Config = config.r2;

    await getR2Client().send(
      new DeleteObjectCommand({
        Bucket: r2Config.bucketName,
        Key: key,
      }),
    );
  }

  getPublicUrl(key: string): string {
    const publicUrl = config.r2.publicUrl.endsWith("/")
      ? config.r2.publicUrl
      : `${config.r2.publicUrl}/`;

    return new URL(key, publicUrl).toString();
  }
}
