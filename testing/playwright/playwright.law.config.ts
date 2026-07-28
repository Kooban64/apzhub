import { config as loadEnv } from "dotenv";
import { defineConfig, devices } from "@playwright/test";
import path from "node:path";

import { buildPlaywrightWebServerEnv } from "./web-server-env";

loadEnv({ path: path.resolve(__dirname, "../../.env") });

const LAW_PORT = process.env.PLAYWRIGHT_LAW_PORT ?? "3302";
const LAW_BASE_URL =
  process.env.PLAYWRIGHT_LAW_BASE_URL ?? `http://localhost:${LAW_PORT}`;

/** Playwright config for Law Platform UI validation (@apzhub/law-platform). */
export default defineConfig({
  testDir: "./e2e",
  testMatch: /law-015-trust-workflow\.spec\.ts/,
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: "list",
  globalSetup: path.resolve(__dirname, "./global-setup-law.ts"),
  use: {
    baseURL: LAW_BASE_URL,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "law-trust",
      use: {
        ...devices["Desktop Chrome"],
        baseURL: LAW_BASE_URL,
      },
    },
  ],
  ...(process.env.PLAYWRIGHT_LAW_BASE_URL
    ? {}
    : {
        webServer: {
          command: `pnpm --filter @apzhub/law-platform exec next dev --port ${LAW_PORT}`,
          url: `${LAW_BASE_URL}/login`,
          reuseExistingServer: !process.env.CI,
          timeout: 180_000,
          cwd: path.resolve(__dirname, "../.."),
          env: buildPlaywrightWebServerEnv({
            NEXT_PUBLIC_E2E_TEST_HOOKS: "true",
            ALLOW_DEV_REGISTRATION: "true",
            NEXT_PUBLIC_ALLOW_DEV_REGISTRATION: "true",
            PORT: LAW_PORT,
            APP_URL: LAW_BASE_URL,
            NEXT_PUBLIC_APP_URL: LAW_BASE_URL,
            BETTER_AUTH_URL: LAW_BASE_URL,
            NODE_ENV: "development",
          }),
        },
      }),
});
