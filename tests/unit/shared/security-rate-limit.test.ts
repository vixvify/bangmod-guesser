import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ limit: vi.fn() }));
vi.mock("@upstash/redis", () => ({ Redis: class {} }));
vi.mock("@upstash/ratelimit", () => ({
  Ratelimit: class {
    static slidingWindow = vi.fn();
    limit = mocks.limit;
  },
}));

import { clientIp, enforceRateLimit } from "@/shared/lib/security/rate-limit";

beforeEach(() => {
  vi.stubEnv("UPSTASH_REDIS_REST_URL", "https://redis.example.test");
  vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "test-token");
  mocks.limit.mockReset();
});
afterEach(() => vi.unstubAllEnvs());

describe("rate limiting", () => {
  it("does not trust forwarded headers outside Vercel", () => {
    vi.stubEnv("VERCEL", "");
    const request = new Request("https://example.test", { headers: { "x-vercel-forwarded-for": "203.0.113.1" } });
    expect(clientIp(request)).toBeNull();
  });

  it("uses only a valid platform-provided IP on Vercel", () => {
    vi.stubEnv("VERCEL", "1");
    expect(clientIp(new Request("https://example.test", { headers: { "x-vercel-forwarded-for": "203.0.113.1" } }))).toBe("203.0.113.1");
    expect(clientIp(new Request("https://example.test", { headers: { "x-vercel-forwarded-for": "203.0.113.1, 127.0.0.1" } }))).toBeNull();
  });

  it("returns a retry time and never puts the raw identifier in Redis", async () => {
    mocks.limit.mockResolvedValue({ success: false, reset: Date.now() + 5000 });
    await expect(enforceRateLimit("auth", "ip", "203.0.113.1")).rejects.toMatchObject({ status: 429, retryAfter: expect.any(Number) });
    expect(mocks.limit.mock.calls[0][0]).not.toContain("203.0.113.1");
  });

  it("fails closed for mutations and open for reads when Redis fails", async () => {
    mocks.limit.mockRejectedValue(new Error("offline"));
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    await expect(enforceRateLimit("mutation", "user", "user-1")).rejects.toMatchObject({ status: 503 });
    await expect(enforceRateLimit("read", "user", "user-1")).resolves.toBeUndefined();
    log.mockRestore();
  });

  it("treats Upstash timeout as unavailable rather than silently allowing a mutation", async () => {
    mocks.limit.mockResolvedValue({ success: true, reason: "timeout" });
    await expect(enforceRateLimit("auth", "ip", "203.0.113.1")).rejects.toMatchObject({ status: 503 });
  });
});
