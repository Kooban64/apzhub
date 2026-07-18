import { config as loadEnv } from "dotenv";
import { defineConfig, devices } from "@playwright/test";
import path from "node:path";

loadEnv({ path: path.resolve(__dirname, "../../../.env") });

/**
 * PRH-017 — Production smoke suite.
 * CI wiring deferred to M17; runs locally against PLAYWRIGHT_BASE_URL or local webServer.
 */
export default defineConfig({
  testDir: ".",
  testMatch: "**/*.spec.ts",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: "list",
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3300",
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: process.env.PLAYWRIGHT_BASE_URL
    ? undefined
    : {
        command: "pnpm --filter @apzhub/web dev",
        url: "http://localhost:3300/login",
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
        cwd: path.resolve(__dirname, "../../.."),
        env: {
          ...process.env,
          NEXT_PUBLIC_E2E_TEST_HOOKS: "true",
        },
      },
});
