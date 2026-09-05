import "server-only";

import { S3Client } from "@aws-sdk/client-s3";

import { IMAGE_MESSAGES } from "@/core/constants/image";
import { AppError } from "@/core/errors/app.error";
import {
  R2ConfigSchema,
  type R2Config,
} from "@/core/schema/image.schema";

let r2Client: S3Client | undefined;

export function getR2Config(): R2Config {
  const result = R2ConfigSchema.safeParse({
    R2_ACCOUNT_ID: process.env.R2_ACCOUNT_ID,
    R2_ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID,
    R2_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY,
    R2_BUCKET_NAME: process.env.R2_BUCKET_NAME,
    R2_PUBLIC_URL: process.env.R2_PUBLIC_URL,
  });

  if (!result.success) {
    throw new AppError(IMAGE_MESSAGES.storageNotConfigured, 500);
  }

  return result.data;
}

export function getR2Client(config: R2Config): S3Client {
  if (!r2Client) {
    r2Client = new S3Client({
      region: "auto",
      endpoint: `https://${config.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: config.R2_ACCESS_KEY_ID,
        secretAccessKey: config.R2_SECRET_ACCESS_KEY,
      },
    });
  }

  return r2Client;
}
