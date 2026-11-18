import { betterAuth } from "better-auth";
import { memoryAdapter } from "better-auth/adapters/memory";
import { afterEach, describe, expect, it, vi } from "vitest";
import { auth } from "@/features/auth/server/auth";
import { createUserModel } from "../../fixtures/users";

const origin = "http://localhost:3000";
const expiry = new Date("2099-11-21T00:00:00.000Z");

afterEach(() => vi.unstubAllGlobals());

describe("Google sign-in callback", () => {
  it.each([
    { name: "timed suspension", banExpires: expiry, error: "BANNED_USER", description: expiry.toISOString() },
    { name: "permanent suspension", banExpires: null, error: "BANNED_USER", description: null },
    { name: "expired suspension", banExpires: new Date("2000-01-01Z"), error: null, description: null },
    { name: "verified password account", linked: false, banExpires: null, error: null, description: null },
    { name: "unverified password account", linked: false, emailVerified: false, banExpires: null, error: "account_not_linked", description: null },
    { name: "new Google account", linked: false, newUser: true, banExpires: null, error: null, description: null },
  ])("handles a $name", async ({ linked = true, emailVerified = true, newUser = false, banExpires, error, description }) => {
    const user = createUserModel({ banned: linked, banExpires, emailVerified });
    const database = {
      user: newUser ? [] : [user],
      account: newUser ? [] : [{
        id: "account-1",
        userId: user.id,
        providerId: linked ? "google" : "credential",
        accountId: linked ? "google-1" : user.id,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      }],
      session: [],
      verification: [],
    };
    const instance = betterAuth({
      ...auth.options,
      baseURL: origin,
      trustedOrigins: [origin],
      database: memoryAdapter(database),
      socialProviders: {
        google: {
          clientId: "test-google-client",
          clientSecret: "test-google-secret",
          getUserInfo: async () => ({
            user: { email: user.email, emailVerified: true },
            data: {
              sub: "google-1",
              name: user.name,
              email: user.email,
              email_verified: true,
              aud: "test-google-client",
              azp: "test-google-client",
              iss: "https://accounts.google.com",
              exp: 4_102_444_800,
              iat: 1_800_000_000,
              given_name: "KMUTT",
              family_name: "Student",
              picture: "",
            },
          }),
        },
      },
    });
    vi.stubGlobal("fetch", vi.fn(async () => Response.json({ access_token: "test-access-token" })));
    const start = await instance.api.signInSocial({
      body: { provider: "google", callbackURL: "/", errorCallbackURL: "/login" },
      returnHeaders: true,
    });
    const state = new URL(start.response.url!).searchParams.get("state")!;
    const cookie = start.headers.getSetCookie().map((value) => value.split(";")[0]).join("; ");
    const callback = new URL("/api/auth/callback/google", origin);
    callback.search = new URLSearchParams({ code: "test-code", state }).toString();

    const response = await instance.handler(new Request(callback, { headers: { cookie } }));

    expect(response.status).toBe(302);
    const location = new URL(response.headers.get("location")!, origin);
    expect(location.pathname).toBe(error ? "/login" : "/");
    expect(location.searchParams.get("error")).toBe(error);
    if (description || !error) {
      expect(location.searchParams.get("error_description")).toBe(description);
    }
    expect(database.session).toHaveLength(error ? 0 : 1);
    if (newUser) {
      expect(database.user).toMatchObject([{ email: user.email, emailVerified: true }]);
    } else if (!linked) {
      expect(database.user).toHaveLength(1);
      expect(database.account.some((account) => account.providerId === "google" && account.userId === user.id))
        .toBe(!error);
    }
  });
});
