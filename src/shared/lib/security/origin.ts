import { AppError } from "@/shared/errors/app.error";
import { config } from "@/shared/config/runtime";

export function checkOrigin(request: Request): void {
  const origin = request.headers.get("origin");
  const fetchSite = request.headers.get("sec-fetch-site");
  if (!origin) {
    if (request.method === "GET" && fetchSite === "same-origin") return;
    if (config.isProduction || fetchSite) throw new AppError("Forbidden", 403);
    return;
  }
  if (!config.trustedOrigins.includes(origin)) throw new AppError("Forbidden", 403);
}
