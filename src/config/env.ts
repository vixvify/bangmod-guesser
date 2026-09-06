import { z } from "zod";

import { IMAGE_MESSAGES } from "@/core/constants/image";
import { AppError } from "@/core/errors/app.error";

const NodeEnvironmentSchema = z.enum(["development", "test", "production"]);

const ApiEnvironmentSchema = z.object({
  url: z
    .string()
    .trim()
    .url()
    .transform((value) => value.replace(/\/+$/, "")),
});

const R2EnvironmentSchema = z.object({
  accountId: z.string().trim().min(1),
  accessKeyId: z.string().trim().min(1),
  secretAccessKey: z.string().trim().min(1),
  bucketName: z.string().trim().min(1),
  publicUrl: z.string().trim().url(),
});

export type R2Config = z.infer<typeof R2EnvironmentSchema>;

function getR2Config(): R2Config {
  const result = R2EnvironmentSchema.safeParse({
    accountId: process.env.R2_ACCOUNT_ID,
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    bucketName: process.env.R2_BUCKET_NAME,
    publicUrl: process.env.R2_PUBLIC_URL,
  });

  if (!result.success) {
    throw new AppError(IMAGE_MESSAGES.storageNotConfigured, 500);
  }

  return result.data;
}

function getApiUrl() {
  const result = ApiEnvironmentSchema.safeParse({
    url: process.env.NEXT_PUBLIC_API_URL,
  });

  if (!result.success) {
    throw new AppError("API URL is not configured", 500);
  }

  return result.data.url;
}

export const config = {
  get apiUrl() {
    return getApiUrl();
  },

  get environment() {
    return NodeEnvironmentSchema.parse(process.env.NODE_ENV ?? "development");
  },

  get isProduction() {
    return config.environment === "production";
  },

  get r2() {
    return getR2Config();
  },
};
