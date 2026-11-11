import { createHmac } from "node:crypto";
import { isIP } from "node:net";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { config } from "@/shared/config/runtime";
import { RATE_LIMITS, type RateLimitGroup } from "@/shared/config/security";
import { AppError } from "@/shared/errors/app.error";

const instances = new Map<RateLimitGroup, Ratelimit>();

function getLimiter(group: RateLimitGroup): Ratelimit | null {
  const settings = config.rateLimitRedis;
  if (!settings) return null;
  let limiter = instances.get(group);
  if (!limiter) {
    const policy = RATE_LIMITS[group];
    limiter = new Ratelimit({
      redis: new Redis(settings),
      limiter: Ratelimit.slidingWindow(policy.requests, policy.window),
      prefix: `bangmod:ratelimit:${group}`,
      timeout: 1500,
      analytics: false,
    });
    instances.set(group, limiter);
  }
  return limiter;
}

export function clientIp(request: Request): string | null {
  if (!config.isVercel) return null;
  const value = request.headers.get("x-vercel-forwarded-for")?.trim();
  return value && isIP(value) ? value : null;
}

export async function enforceRateLimit(
  group: RateLimitGroup,
  kind: "ip" | "user",
  identifier: string,
): Promise<void> {
  const policy = RATE_LIMITS[group];
  let result;
  try {
    const limiter = getLimiter(group);
    if (!limiter) {
      if (!config.isProduction) return;
      throw new Error("Rate limiter unavailable");
    }
    const digest = createHmac("sha256", config.authSecret)
      .update(`${kind}:${identifier}`)
      .digest("hex");
    result = await limiter.limit(`${kind}:${digest}`);
    if (result.reason === "timeout") throw new Error("Rate limiter timed out");
  } catch (error) {
    if (policy.failure === "closed")
      throw new AppError("Service temporarily unavailable", 503);
    console.error(
      "Rate limit unavailable",
      error instanceof Error ? error.name : "unknown",
    );
    return;
  }
  if (!result.success) {
    throw new RateLimitError(
      Math.max(1, Math.ceil((result.reset - Date.now()) / 1000)),
    );
  }
}

export class RateLimitError extends AppError {
  constructor(public readonly retryAfter: number) {
    super("Too many requests", 429);
  }
}
