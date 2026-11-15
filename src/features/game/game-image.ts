"use client";

const images = new Map<string, Promise<void>>();

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
