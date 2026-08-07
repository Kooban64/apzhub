/**
 * H5 multi-browser projects config.
 * Usage:
 *   PLAYWRIGHT_USE_PROD_SERVER=true PLAYWRIGHT_WEB_PORT=3315 PLAYWRIGHT_BASE_URL=http://127.0.0.1:3315 \
 *   pnpm exec playwright test --config=testing/playwright/playwright.h5.config.ts
 */
import { config as loadEnv } from "dotenv";
import { defineConfig, devices } from "@playwright/test";
import path from "node:path";

import { buildPlaywrightWebServerEnv } from "./web-server-env";

loadEnv({ path: path.resolve(__dirname, "../../.env") });

const playwrightPort = process.env.PLAYWRIGHT_WEB_PORT ?? "3315";
const playwrightOrigin =
  process.env.PLAYWRIGHT_BASE_URL ?? `http://127.0.0.1:${playwrightPort}`;
const useProdServer = process.env.PLAYWRIGHT_USE_PROD_SERVER === "true";
const repoRoot = path.resolve(__dirname, "../..");
const standaloneRoot = path.resolve(repoRoot, "apps/web/.next/standalone");
const webServerCommand = useProdServer
  ? `bash -lc 'mkdir -p apps/web/.next && rm -rf apps/web/.next/static && cp -a "${repoRoot}/apps/web/.next/static" apps/web/.next/static && cp -a "${repoRoot}/apps/web/public" apps/web/public && node apps/web/server.js'`
  : `pnpm --filter @apzhub/web exec next dev -p ${playwrightPort} -H 127.0.0.1`;

export default defineConfig({
  testDir: "./e2e",
  testMatch: /apzhub-projects-h5-cross-platform\.spec\.ts/,
  fullyParallel: false,
  retries: 0,
  workers: 1,
  reporter: "list",
  globalSetup: path.resolve(__dirname, "./global-setup.ts"),
  use: {
    baseURL: playwrightOrigin,
    trace: "on-first-retry",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
    // Edge Chromium engine parity (Playwright Desktop Edge profile; no msedge channel required)
    { name: "edge", use: { ...devices["Desktop Edge"] } },
  ],
  webServer: {
    command: webServerCommand,
    url: `${playwrightOrigin}/login`,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    cwd: useProdServer ? standaloneRoot : repoRoot,
    env: buildPlaywrightWebServerEnv({
      PORT: playwrightPort,
      HOSTNAME: "127.0.0.1",
      APP_URL: playwrightOrigin,
      NEXT_PUBLIC_APP_URL: playwrightOrigin,
      BETTER_AUTH_URL: playwrightOrigin,
      NEXT_PUBLIC_E2E_TEST_HOOKS: "true",
      ...(useProdServer
        ? {
            NODE_ENV: "production",
            ALLOW_DEV_REGISTRATION: "false",
            NEXT_PUBLIC_ALLOW_DEV_REGISTRATION: "false",
            APZHUB_WORKSPACE_ROOT: repoRoot,
            APZHUB_RUNTIME_FAIL_FAST: "false",
          }
        : {
            ALLOW_DEV_REGISTRATION: "true",
            NEXT_PUBLIC_ALLOW_DEV_REGISTRATION: "true",
          }),
    }),
  },
});
