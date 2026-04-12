import { defineConfig, devices } from "@playwright/test";

const E2E_SESSION_SIGNING_SECRET = "e2e-test-session-signing-secret-32chars";

export default defineConfig({
  testDir: "test/e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? "github" : "list",
  // Required when webServer is an array; default suite uses the mock dev server on 3005.
  use: {
    baseURL: "http://127.0.0.1:3005",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
      testIgnore: "**/auth-login-recovery.local.spec.ts",
    },
    {
      name: "chromium-local-login-shell",
      use: {
        ...devices["Desktop Chrome"],
        baseURL: "http://127.0.0.1:3006",
      },
      testMatch: "**/auth-login-recovery.local.spec.ts",
    },
  ],
  webServer: [
    {
      name: "mock-identity",
      command: "npm run dev -- -p 3005",
      url: "http://127.0.0.1:3005",
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
    {
      name: "local-login-shell",
      command: "npm run dev -- -p 3006",
      url: "http://127.0.0.1:3006",
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      env: {
        ...process.env,
        APZHUB_IDENTITY_SOURCE: "local",
        APZHUB_SESSION_SIGNING_SECRET: E2E_SESSION_SIGNING_SECRET,
        APZHUB_NEXT_DIST_DIR: ".next-e2e-local",
      },
    },
  ],
});
