import type { MetadataRoute } from "next";
import { config } from "@/shared/config/runtime";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/api/" },
    ...(config.isPreview ? {} : { sitemap: new URL("/sitemap.xml", config.authUrl).href }),
  };
}
