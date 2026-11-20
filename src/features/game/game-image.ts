"use client";

import { HttpError } from "@/shared/lib/http";
import { GameRoutes } from "./game.routes";

const images = new Map<string, Promise<void>>();
const encryptedImages = new Map<string, Promise<ArrayBuffer>>();

export function preloadGameImage(url: string): Promise<void> {
  const existing = images.get(url);
  if (existing) return existing;
  const loading = new Promise<void>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve();
    image.onerror = () => reject(new Error("Image failed to load"));
    image.src = url;
  });
  images.set(url, loading);
  void loading.catch(() => images.delete(url));
  return loading;
}

export function preloadEncryptedRoundImage(gameId: string, questionNumber: number): Promise<ArrayBuffer> {
  const url = GameRoutes.encryptedRoundImage(gameId, questionNumber);
  const existing = encryptedImages.get(url);
  if (existing) return existing;

  const loading = (async () => {
    const response = await fetch(url, {
      credentials: "include",
      cache: "no-store",
      signal: AbortSignal.timeout(20_000),
    });
    if (!response.ok) {
      const body = await response.json().catch(() => null);
      throw new HttpError(body?.error ?? "Round image unavailable", response.status, body?.statusCode);
    }
    return response.arrayBuffer();
  })();
  if (encryptedImages.size >= 2) {
    const oldest = encryptedImages.keys().next().value;
    if (oldest) encryptedImages.delete(oldest);
  }
  encryptedImages.set(url, loading);
  void loading.catch(() => {
    if (encryptedImages.get(url) === loading) encryptedImages.delete(url);
  });
  return loading;
}

export async function decryptPreloadedRoundImage(
  gameId: string,
  questionNumber: number,
  imageKey: string,
  originalUrl: string,
): Promise<string | null> {
  const pending = encryptedImages.get(GameRoutes.encryptedRoundImage(gameId, questionNumber));
  if (!pending) return null;
  const payload = await pending;
  const rawKey = Uint8Array.from(atob(imageKey), (character) => character.charCodeAt(0));
  const key = await crypto.subtle.importKey("raw", rawKey, "AES-GCM", false, ["decrypt"]);
  const image = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: payload.slice(0, 12) },
    key,
    payload.slice(12),
  );
  const extension = new URL(originalUrl, window.location.origin).pathname.split(".").pop();
  const type = extension === "webp" ? "image/webp" : extension === "png" ? "image/png" : "image/jpeg";
  return URL.createObjectURL(new Blob([image], { type }));
}
