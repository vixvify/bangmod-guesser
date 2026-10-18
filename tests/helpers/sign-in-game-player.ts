import { createHash } from "node:crypto";
import { expect, type Page, type TestInfo } from "@playwright/test";
import { E2E_BASE_URL } from "../../e2e/config";

const password = "TestPassword1!";

export async function signInGamePlayer(page: Page, testInfo: TestInfo) {
  const id = createHash("sha256").update(testInfo.testId).digest("hex").slice(0, 12);
  const email = `game-player-${id}@example.test`;
  const headers = { Origin: E2E_BASE_URL };
  const credentials = { email, password };

  let login = await page.request.post("/api/auth/sign-in/email", {
    data: credentials,
    headers,
  });
  if (!login.ok()) {
    const registration = await page.request.post("/api/auth/sign-up/email", {
      data: { name: "Game Test Player", ...credentials },
      headers,
    });
    expect(registration.ok()).toBe(true);
    login = await page.request.post("/api/auth/sign-in/email", {
      data: credentials,
      headers,
    });
  }
  expect(login.ok()).toBe(true);
}
