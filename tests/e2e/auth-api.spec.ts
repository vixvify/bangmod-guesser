import { expect, test } from "@playwright/test";

test("completes the auth API workflow", async ({ request }) => {
  const email = `e2e-${Date.now()}@example.com`;
  const password = "Password123";
  const registration = await request.post("/api/auth/register", {
    data: {
      name: "KMUTT Student",
      email,
      password,
      confirmPassword: password,
    },
  });

  expect(registration.status()).toBe(201);
  await expect(registration.json()).resolves.toMatchObject({
    data: { email, role: "USER" },
    status: 201,
    statusCode: "CREATED",
  });

  const duplicateRegistration = await request.post("/api/auth/register", {
    data: {
      name: "KMUTT Student",
      email,
      password,
      confirmPassword: password,
    },
  });
  expect(duplicateRegistration.status()).toBe(409);

  const invalidLogin = await request.post("/api/auth/login", {
    data: { email, password: "WrongPassword123" },
  });
  expect(invalidLogin.status()).toBe(401);

  const login = await request.post("/api/auth/login", {
    data: { email, password },
  });
  expect(login.status()).toBe(200);
  expect(login.headers()["set-cookie"]).toContain("accessToken=");

  const currentUser = await request.get("/api/auth/me");
  expect(currentUser.status()).toBe(200);
  await expect(currentUser.json()).resolves.toMatchObject({
    data: { email, role: "USER" },
  });

  const logout = await request.post("/api/auth/logout");
  expect(logout.status()).toBe(200);

  const unauthenticatedUser = await request.get("/api/auth/me");
  expect(unauthenticatedUser.status()).toBe(401);
});
