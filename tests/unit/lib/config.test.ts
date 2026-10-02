import { afterEach, describe, expect, it, vi } from "vitest";
import { config } from "@/lib/config";

afterEach(() => vi.unstubAllEnvs());

describe("Google OAuth configuration", () => {
  it("leaves Google disabled when credentials are absent", () => {
    vi.stubEnv("GOOGLE_CLIENT_ID", "");
    vi.stubEnv("GOOGLE_CLIENT_SECRET", "");

    expect(config.googleOAuth).toBeNull();
  });

  it("reads and trims both credentials", () => {
    vi.stubEnv("GOOGLE_CLIENT_ID", " client-id ");
    vi.stubEnv("GOOGLE_CLIENT_SECRET", " client-secret ");

    expect(config.googleOAuth).toEqual({
      clientId: "client-id",
      clientSecret: "client-secret",
    });
  });

  it("rejects a partially configured provider", () => {
    vi.stubEnv("GOOGLE_CLIENT_ID", "client-id");
    vi.stubEnv("GOOGLE_CLIENT_SECRET", "");

    expect(() => config.googleOAuth).toThrow("Google OAuth configuration is incomplete");
  });
});

describe("initial admin configuration", () => {
  it("normalizes a configured email", () => {
    vi.stubEnv("INITIAL_ADMIN_EMAIL", "  Admin@Example.com  ");

    expect(config.initialAdminEmail).toBe("admin@example.com");
  });

  it("rejects a missing or invalid email", () => {
    vi.stubEnv("INITIAL_ADMIN_EMAIL", "");
    expect(() => config.initialAdminEmail).toThrow("INITIAL_ADMIN_EMAIL must be a valid email address");

    vi.stubEnv("INITIAL_ADMIN_EMAIL", "not-an-email");
    expect(() => config.initialAdminEmail).toThrow("INITIAL_ADMIN_EMAIL must be a valid email address");
  });
});
