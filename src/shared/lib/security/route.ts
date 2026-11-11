import { UserRole, type User } from "@/features/users/user";
import { config } from "@/shared/config/runtime";
import { AppError } from "@/shared/errors/app.error";
import { roleCheck } from "@/shared/lib/role-check";
import { errorResponse } from "@/shared/lib/api-response";
import type { RateLimitGroup } from "@/shared/config/security";
import { checkOrigin } from "./origin";
import { clientIp, enforceRateLimit, RateLimitError } from "./rate-limit";

export type RoutePolicy = {
  access: "public" | "authenticated" | "admin";
  rateLimit: RateLimitGroup;
  origin?: "app" | "better-auth" | "always";
};

export function secureRoute<C>(policy: RoutePolicy & { access: "public" }, handler: (request: Request, context: C, user: null) => Promise<Response>): (request: Request, context?: C) => Promise<Response>;
export function secureRoute<C>(policy: RoutePolicy & { access: "authenticated" | "admin" }, handler: (request: Request, context: C, user: User) => Promise<Response>): (request: Request, context?: C) => Promise<Response>;
export function secureRoute<C>(policy: RoutePolicy, handler: (request: Request, context: C, user: never) => Promise<Response>) {
  return async (request: Request, context?: C): Promise<Response> => {
    try {
      if (policy.origin === "always" || (policy.origin !== "better-auth" && !["GET", "HEAD", "OPTIONS"].includes(request.method))) checkOrigin(request);
      const ip = clientIp(request);
      if (!ip && config.isProduction && policy.rateLimit !== "read") {
        throw new AppError("Service temporarily unavailable", 503);
      }
      if (ip) await enforceRateLimit(policy.rateLimit, "ip", ip);
      else if (!config.isProduction) await enforceRateLimit(policy.rateLimit, "ip", "local");
      const user = policy.access === "public"
        ? null
        : await (await import("@/features/auth/server/auth-check")).requireAuth();
      if (user) {
        if (policy.access === "admin") roleCheck(user, [UserRole.ADMIN]);
        await enforceRateLimit(policy.rateLimit, "user", user.id);
      }
      return await handler(request, context as C, user as never);
    } catch (error) {
      const response = errorResponse(error);
      if (error instanceof RateLimitError) response.headers.set("Retry-After", String(error.retryAfter));
      return response;
    }
  };
}
