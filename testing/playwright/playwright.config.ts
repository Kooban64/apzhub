import { config as loadEnv } from "dotenv";
import { defineConfig, devices } from "@playwright/test";
import path from "node:path";

import { buildPlaywrightWebServerEnv } from "./web-server-env";

loadEnv({ path: path.resolve(__dirname, "../../.env") });

const playwrightPort = process.env.PLAYWRIGHT_WEB_PORT ?? "3300";
const playwrightOrigin =
  process.env.PLAYWRIGHT_BASE_URL ?? `http://localhost:${playwrightPort}`;
/**
 * Prefer standalone production server when host `next dev` is already bound
 * (coexistence with long-lived :3300) — `next start` is incompatible with
 * `output: "standalone"`.
 */
const useProdServer = process.env.PLAYWRIGHT_USE_PROD_SERVER === "true";
const repoRoot = path.resolve(__dirname, "../..");
const standaloneRoot = path.resolve(repoRoot, "apps/web/.next/standalone");
const webServerCommand = useProdServer
  ? `bash -lc 'mkdir -p apps/web/.next && rm -rf apps/web/.next/static && cp -a "${repoRoot}/apps/web/.next/static" apps/web/.next/static && cp -a "${repoRoot}/apps/web/public" apps/web/public && node apps/web/server.js'`
  : `pnpm --filter @apzhub/web exec next dev -p ${playwrightPort} -H 127.0.0.1`;
const webServerCwd = useProdServer ? standaloneRoot : repoRoot;

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
    baseURL: playwrightOrigin,
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: webServerCommand,
    url: `${playwrightOrigin}/login`,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    cwd: webServerCwd,
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
            APZHUB_WORKSPACE_ROOT: path.resolve(__dirname, "../.."),
            // Standalone host coexistence: discovery diagnostics are non-fatal in
            // the long-lived next-dev profile; keep E2E prod server aligned.
            APZHUB_RUNTIME_FAIL_FAST: "false",
          }
        : {
            ALLOW_DEV_REGISTRATION: "true",
            NEXT_PUBLIC_ALLOW_DEV_REGISTRATION: "true",
          }),
    }),
  },
});
