import { config as loadEnv } from "dotenv";
import { defineConfig, devices } from "@playwright/test";
import path from "node:path";

import { buildPlaywrightWebServerEnv } from "./web-server-env";

loadEnv({ path: path.resolve(__dirname, "../../.env") });

export default defineConfig({
  testDir: "./e2e",
  /**
   * RG-LAW-SUITE-SCOPE (APZHUB-ENG-0016): Law Trust E2E belongs exclusively under
   * `playwright.law.config.ts` (`pnpm test:e2e:law`). Helpers target Law origin :3302;
   * running under main `test:e2e` (:3300) produces Better Auth Invalid origin failures.
   */
  testIgnore: [/law-015-trust-workflow\.spec\.ts/],
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: "list",
  globalSetup: path.resolve(__dirname, "./global-setup.ts"),
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3300",
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "pnpm --filter @apzhub/web dev",
    url: "http://localhost:3300/login",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    cwd: path.resolve(__dirname, "../.."),
    env: buildPlaywrightWebServerEnv({
      NEXT_PUBLIC_E2E_TEST_HOOKS: "true",
      ALLOW_DEV_REGISTRATION: "true",
      NEXT_PUBLIC_ALLOW_DEV_REGISTRATION: "true",
    }),
  },
});
