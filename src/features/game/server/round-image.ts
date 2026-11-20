import { createCipheriv, createHmac, randomBytes } from "node:crypto";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { IMAGE_MAX_SIZE_BYTES } from "@/features/images/image.constants";
import { extractImageKey } from "@/features/images/server/image-key";
import { config } from "@/shared/config/runtime";
import { AppError } from "@/shared/errors/app.error";

export function roundImageKey(gameId: string, questionNumber: number): Buffer {
  return createHmac("sha256", config.authSecret)
    .update(JSON.stringify(["game-round-image-v1", gameId, questionNumber]))
    .digest();
}

async function readRoundImage(url: string): Promise<Uint8Array> {
  if (/^\/images\/[\w-]+\.(?:jpg|png|webp)$/.test(url)) {
    return readFile(join(process.cwd(), "public", url.slice(1)));
  }

  const key = extractImageKey(url);
  if (!key) throw new AppError("Round image unavailable", 409);
  const { getR2Client } = await import("@/features/images/server/r2");
  const object = await getR2Client().send(new GetObjectCommand({
    Bucket: config.r2.bucketName,
    Key: key,
  }), { abortSignal: AbortSignal.timeout(15_000) });
  if (!object.Body || object.ContentLength === undefined || object.ContentLength > IMAGE_MAX_SIZE_BYTES) {
    throw new AppError("Round image unavailable", 409);
  }
  return object.Body.transformToByteArray();
}

export async function encryptRoundImage(url: string, gameId: string, questionNumber: number): Promise<Uint8Array<ArrayBuffer>> {
  const image = await readRoundImage(url);
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", roundImageKey(gameId, questionNumber), iv);
  const ciphertext = Buffer.concat([cipher.update(image), cipher.final(), cipher.getAuthTag()]);
  const payload = new Uint8Array(iv.length + ciphertext.length);
  payload.set(iv);
  payload.set(ciphertext, iv.length);
  return payload;
}
