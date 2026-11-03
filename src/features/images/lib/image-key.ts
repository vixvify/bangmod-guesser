export function extractImageKey(url: string): string | null {
  try {
    return new URL(url).pathname.match(
      /(?:^|\/)(images\/[a-f0-9-]+\.(?:jpg|png|webp))$/,
    )?.[1] ?? null;
  } catch {
    return null;
  }
}
