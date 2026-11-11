import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AppError } from "@/shared/errors/app.error";

const mocks = vi.hoisted(() => ({ requireAuth: vi.fn(), enforce: vi.fn(), origin: vi.fn(), ip: vi.fn() }));
vi.mock("@/features/auth/server/auth-check", () => ({ requireAuth: mocks.requireAuth }));
vi.mock("@/shared/lib/security/origin", () => ({ checkOrigin: mocks.origin }));
vi.mock("@/shared/lib/security/rate-limit", async () => {
  const { AppError } = await import("@/shared/errors/app.error");
  return {
    clientIp: mocks.ip,
    enforceRateLimit: mocks.enforce,
    RateLimitError: class extends AppError {
      constructor(public retryAfter: number) { super("Too many requests", 429); }
    },
  };
});

import { secureRoute } from "@/shared/lib/security/route";
import { RateLimitError } from "@/shared/lib/security/rate-limit";

beforeEach(() => {
  vi.clearAllMocks();
  mocks.ip.mockReturnValue("203.0.113.1");
  mocks.requireAuth.mockResolvedValue({ id: "u1", role: "USER" });
});

afterEach(() => vi.unstubAllEnvs());

describe("central request handler", () => {
  it("rejects non-admins before executing an admin handler", async () => {
    const handler = vi.fn();
    const route = secureRoute({ access: "admin", rateLimit: "admin" }, handler);
    expect((await route(new Request("http://localhost/api"))).status).toBe(403);
    expect(handler).not.toHaveBeenCalled();
  });

  it("validates unsafe requests and applies separate IP and user limits", async () => {
    const handler = vi.fn().mockResolvedValue(new Response("ok"));
    const route = secureRoute({ access: "authenticated", rateLimit: "mutation" }, handler);
    expect((await route(new Request("http://localhost/api", { method: "POST" }))).status).toBe(200);
    expect(mocks.origin).toHaveBeenCalledOnce();
    expect(mocks.enforce).toHaveBeenCalledWith("mutation", "ip", "203.0.113.1");
    expect(mocks.enforce).toHaveBeenCalledWith("mutation", "user", "u1");
  });

  it("returns 429 and Retry-After without entering the handler", async () => {
    mocks.enforce.mockRejectedValueOnce(new RateLimitError(12));
    const handler = vi.fn();
    const response = await secureRoute({ access: "public", rateLimit: "auth" }, handler)(new Request("http://localhost/api"));
    expect(response.status).toBe(429);
    expect(response.headers.get("retry-after")).toBe("12");
    expect(handler).not.toHaveBeenCalled();
  });

  it("returns a safe error when the origin check fails", async () => {
    mocks.origin.mockImplementationOnce(() => { throw new AppError("Forbidden", 403); });
    const handler = vi.fn();
    const response = await secureRoute({ access: "public", rateLimit: "auth" }, handler)(new Request("http://localhost/api", { method: "POST" }));
    expect(response.status).toBe(403);
    expect(handler).not.toHaveBeenCalled();
  });

  it("fails closed on sensitive production requests without a trusted IP", async () => {
    vi.stubEnv("NODE_ENV", "production");
    mocks.ip.mockReturnValue(null);
    const handler = vi.fn();
    const response = await secureRoute({ access: "public", rateLimit: "auth" }, handler)(new Request("https://example.com/api", { method: "POST" }));
    expect(response.status).toBe(503);
    expect(handler).not.toHaveBeenCalled();
  });
});
