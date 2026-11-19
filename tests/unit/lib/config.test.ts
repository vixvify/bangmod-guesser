import { afterEach, describe, expect, it, vi } from "vitest";
import { config } from "@/shared/config/runtime";

afterEach(() => vi.unstubAllEnvs());

describe("database connection configuration", () => {
  it("allows at least 15 seconds for a Neon connection and pool acquisition", () => {
    vi.stubEnv("DATABASE_URL", "postgresql://user:pass@ep-test-pooler.us-east-2.aws.neon.tech/app?sslmode=require&connect_timeout=5");

    const { searchParams } = new URL(config.databaseUrl!);
    expect(searchParams.get("connect_timeout")).toBe("15");
    expect(searchParams.get("pool_timeout")).toBe("15");
    expect(searchParams.get("sslmode")).toBe("require");
  });

  it("honors longer or explicitly unlimited Neon timeouts", () => {
    const url = "postgresql://user:pass@ep-test.us-east-2.aws.neon.tech/app?connect_timeout=30&pool_timeout=0";
    vi.stubEnv("DATABASE_URL", url);

    expect(config.databaseUrl).toBe(url);
  });

  it("leaves local databases on their existing settings", () => {
    const url = "postgresql://user:pass@localhost:5432/app?connect_timeout=5";
    vi.stubEnv("DATABASE_URL", url);

    expect(config.databaseUrl).toBe(url);
  });
});

describe("rate limit configuration", () => {
  it("rejects incomplete credentials and insecure Redis URLs", () => {
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "http://redis.example.com");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "");
    expect(() => config.rateLimitRedis).toThrow("configuration is incomplete");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "token");
    expect(() => config.rateLimitRedis).toThrow("must use HTTPS");
  });
});

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

describe("Resend configuration", () => {
  it("reads and trims both credentials", () => {
    vi.stubEnv("RESEND_API_KEY", " re_test_api_key ");
    vi.stubEnv("RESEND_FROM_EMAIL", " sender@example.com ");

    expect(config.resend).toEqual({
      apiKey: "re_test_api_key",
      fromEmail: "sender@example.com",
    });
  });

  it("rejects a missing API key", () => {
    vi.stubEnv("RESEND_API_KEY", "");
    vi.stubEnv("RESEND_FROM_EMAIL", "sender@example.com");

    expect(() => config.resend).toThrow("Resend configuration is incomplete or invalid");
  });

  it("rejects a missing sender email", () => {
    vi.stubEnv("RESEND_API_KEY", "re_test_api_key");
    vi.stubEnv("RESEND_FROM_EMAIL", "");

    expect(() => config.resend).toThrow("Resend configuration is incomplete or invalid");
  });

  it("rejects an invalid sender email", () => {
    vi.stubEnv("RESEND_API_KEY", "re_test_api_key");
    vi.stubEnv("RESEND_FROM_EMAIL", "invalid-email");

    expect(() => config.resend).toThrow("Resend configuration is incomplete or invalid");
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
