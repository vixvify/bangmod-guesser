import { defineConfig, devices } from "@playwright/test";
import { E2E_BASE_URL, E2E_DATABASE_URL } from "./e2e/config";

const baseURL = E2E_BASE_URL;

export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  fullyParallel: false,
  reporter: "list",
  use: {
    ...devices["Desktop Chrome"],
    baseURL,
    trace: "retain-on-failure",
  },
  webServer: {
    command: "npm run dev -- --port 3100",
    url: baseURL,
    reuseExistingServer: false,
    timeout: 120_000,
    env: {
      BETTER_AUTH_URL: baseURL,
      NEXT_PUBLIC_API_URL: `${baseURL}/api`,
      DATABASE_URL: E2E_DATABASE_URL,
      BETTER_AUTH_SECRET: "e2e-only-secret-key-at-least-32-characters",
    },
  },
});
