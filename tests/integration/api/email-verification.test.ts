import { betterAuth } from "better-auth";
import { memoryAdapter } from "better-auth/adapters/memory";
import { afterEach, expect, it, vi } from "vitest";
import { auth } from "@/features/auth/server/auth";

const { send } = vi.hoisted(() => ({ send: vi.fn() }));
vi.mock("resend", () => ({ Resend: class { emails = { send }; } }));

const origin = "http://localhost:3000";

afterEach(() => {
  vi.unstubAllEnvs();
  send.mockReset();
});

it("sends a verification link, resends after valid credentials, and allows sign-in after verification", async () => {
  vi.stubEnv("BETTER_AUTH_URL", origin);
  vi.stubEnv("RESEND_API_KEY", "test-resend-key");
  vi.stubEnv("RESEND_FROM_EMAIL", "auth@example.test");
  send.mockResolvedValue({ data: { id: "verification-email" }, error: null });
  const database = { user: [], account: [], session: [], verification: [] };
  const instance = betterAuth({
    ...auth.options,
    baseURL: origin,
    trustedOrigins: [origin],
    database: memoryAdapter(database),
  });
  const body = { name: "Test Player", email: "player@example.test", password: "Password123" };

  const registration = await instance.api.signUpEmail({ body });
  expect(registration.user.emailVerified).toBe(false);
  expect(registration.token).toBeNull();
  expect(send).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({
    to: body.email,
    from: "auth@example.test",
    subject: "ยืนยันอีเมล | Bangmod Guesser",
  }));

  await expect(instance.api.signInEmail({ body: { ...body, password: "wrong-password" } }))
    .rejects.toMatchObject({ statusCode: 401 });
  expect(send).toHaveBeenCalledTimes(1);
  await expect(instance.api.signInEmail({ body }))
    .rejects.toMatchObject({ statusCode: 403, body: { code: "EMAIL_NOT_VERIFIED" } });
  expect(send).toHaveBeenCalledTimes(2);

  const emailText: string = send.mock.lastCall?.[0].text;
  const url = new URL(emailText.split("\n\n")[1]);
  const invalidUrl = new URL(url);
  invalidUrl.searchParams.set("token", "invalid");
  const invalid = await instance.handler(new Request(invalidUrl));
  expect(new URL(invalid.headers.get("location")!).searchParams.get("error")).toBe("INVALID_TOKEN");
  expect(database.session).toHaveLength(0);

  const verification = await instance.handler(new Request(url));
  expect(verification.headers.get("location")).toBe(`${origin}/login?verification=email`);
  expect(database.session).toHaveLength(0);
  expect(await instance.api.signInEmail({ body })).toMatchObject({
    user: { emailVerified: true },
    token: expect.any(String),
  });
  expect(send).toHaveBeenCalledTimes(2);
});
