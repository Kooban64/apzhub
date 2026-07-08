import { config as loadEnv } from "dotenv";
import { defineConfig, devices } from "@playwright/test";
import path from "node:path";

loadEnv({ path: path.resolve(__dirname, "../../.env") });

/** Playwright config for Law Platform UI validation (@apzhub/law-platform on port 3301). */
export default defineConfig({
  testDir: "./e2e",
  testMatch: /law-015-trust-workflow\.spec\.ts/,
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: "list",
  use: {
    baseURL: process.env.PLAYWRIGHT_LAW_BASE_URL ?? "http://localhost:3302",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "law-trust",
      use: {
        ...devices["Desktop Chrome"],
        baseURL: process.env.PLAYWRIGHT_LAW_BASE_URL ?? "http://localhost:3302",
      },
    },
  ],
  ...(process.env.PLAYWRIGHT_LAW_BASE_URL
    ? {}
    : {
        webServer: {
          command: "pnpm --filter @apzhub/law-platform exec next dev --port 3302",
          url: "http://localhost:3302/login",
          reuseExistingServer: !process.env.CI,
          timeout: 180_000,
          cwd: path.resolve(__dirname, "../.."),
          env: {
            NEXT_PUBLIC_E2E_TEST_HOOKS: "true",
            ALLOW_DEV_REGISTRATION: "true",
            NEXT_PUBLIC_ALLOW_DEV_REGISTRATION: "true",
            PORT: "3302",
            APP_URL: "http://localhost:3302",
            NEXT_PUBLIC_APP_URL: "http://localhost:3302",
            BETTER_AUTH_URL: "http://localhost:3302",
          },
        },
      }),
});
