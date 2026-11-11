import { afterEach, describe, expect, it, vi } from "vitest";
import { checkOrigin } from "@/shared/lib/security/origin";

afterEach(() => vi.unstubAllEnvs());

describe("request origin validation", () => {
  it("accepts a configured application origin", () => {
    vi.stubEnv("BETTER_AUTH_URL", "https://app.example.test");
    expect(() => checkOrigin(new Request("https://app.example.test/api", {
      method: "POST", headers: { origin: "https://app.example.test" },
    }))).not.toThrow();
  });

  it("rejects an untrusted origin including a same-site sibling", () => {
    vi.stubEnv("BETTER_AUTH_URL", "https://app.example.test");
    expect(() => checkOrigin(new Request("https://app.example.test/api", {
      method: "POST", headers: { origin: "https://evil.example.test", "sec-fetch-site": "same-site" },
    }))).toThrow("Forbidden");
  });

  it("rejects missing origin in production and accepts same-origin stateful GET", () => {
    vi.stubEnv("NODE_ENV", "production");
    expect(() => checkOrigin(new Request("https://app.example.test/api", { method: "POST" }))).toThrow("Forbidden");
    expect(() => checkOrigin(new Request("https://app.example.test/api", {
      headers: { "sec-fetch-site": "same-origin" },
    }))).not.toThrow();
  });
});
