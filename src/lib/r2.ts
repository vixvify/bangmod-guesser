import "server-only";

import { S3Client } from "@aws-sdk/client-s3";

import { config } from "@/config";

let r2Client: S3Client | undefined;

export function getR2Client(): S3Client {
  const r2Config = config.r2;

  if (!r2Client) {
    r2Client = new S3Client({
      region: "auto",
      endpoint: `https://${r2Config.accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: r2Config.accessKeyId,
        secretAccessKey: r2Config.secretAccessKey,
      },
    });
  }

  return r2Client;
}
