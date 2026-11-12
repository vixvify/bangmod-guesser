import type { MetadataRoute } from "next";
import { config } from "@/shared/config/runtime";

export default function sitemap(): MetadataRoute.Sitemap {
  return config.isPreview ? [] : [{ url: new URL("/", config.authUrl).origin }];
}
