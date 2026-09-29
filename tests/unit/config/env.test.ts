import { afterEach, describe, expect, it, vi } from "vitest";
import { config } from "@/config";

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
