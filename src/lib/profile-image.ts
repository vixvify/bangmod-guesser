import { getImageProps } from "next/image";

export function getProfileImageUrl(image: string | null | undefined): string | undefined {
  if (!image) return undefined;

  try {
    const url = new URL(image);
    if (
      url.protocol === "https:" &&
      url.hostname === "lh3.googleusercontent.com" &&
      url.port === "" &&
      url.pathname.startsWith("/a/")
    ) {
      return getImageProps({ src: image, alt: "", width: 96, height: 96 }).props.src;
    }
  } catch {
    return image;
  }

  return image;
}
