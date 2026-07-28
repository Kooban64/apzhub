/**
 * APZHUB-ENG-0007 / RG-LAW-DNS
 * Law Platform Playwright setup: healthy /api/health + deterministic DEV credentials
 * against PLAYWRIGHT_LAW_BASE_URL (default http://localhost:3302).
 */
import { config as loadEnv } from "dotenv";
import { execFileSync } from "node:child_process";
import path from "node:path";

loadEnv({ path: path.resolve(__dirname, "../../.env") });

export const DEV_E2E_EMAIL = "dev@apzhub.local";
export const DEV_E2E_PASSWORD = "DevPassword123!";
export const DEV_E2E_NAME = "Dev User";

const ROOT = path.resolve(__dirname, "../..");
const BASE_URL =
  process.env.PLAYWRIGHT_LAW_BASE_URL ??
  `http://localhost:${process.env.PLAYWRIGHT_LAW_PORT ?? "3302"}`;

async function waitForHealthy(timeoutMs = 120_000): Promise<void> {
  const started = Date.now();
  let last = "not-called";
  while (Date.now() - started < timeoutMs) {
    try {
      const response = await fetch(`${BASE_URL}/api/health`);
      last = `status=${response.status}`;
      if (response.status === 200) {
        const body = (await response.json()) as {
          status?: string;
          dependencies?: {
            database?: { status?: string };
            redis?: { status?: string };
          };
        };
        if (
          body.status === "healthy" &&
          body.dependencies?.database?.status === "healthy" &&
          body.dependencies?.redis?.status === "healthy"
        ) {
          return;
        }
        last = `${last}; body=${JSON.stringify({
          status: body.status,
          database: body.dependencies?.database?.status,
          redis: body.dependencies?.redis?.status,
        })}`;
      }
    } catch (error) {
      last = error instanceof Error ? error.message : "fetch-failed";
    }
    await new Promise((resolve) => setTimeout(resolve, 1_500));
  }
  throw new Error(
    `RG-LAW-DNS: Law /api/health did not become healthy within ${timeoutMs}ms (${last})`,
  );
}

async function postAuth(
  pathName: "/api/auth/sign-in/email" | "/api/auth/sign-up/email",
  body: Record<string, string>,
): Promise<boolean> {
  for (let attempt = 1; attempt <= 5; attempt += 1) {
    try {
      const response = await fetch(`${BASE_URL}${pathName}`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          origin: BASE_URL,
          referer: `${BASE_URL}/login`,
        },
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        const detail = await response.text();
        console.warn(
          `[e2e-setup-law] ${pathName} HTTP ${response.status}: ${detail.slice(0, 200)}`,
        );
      }
      return response.ok;
    } catch (error) {
      const message = error instanceof Error ? error.message : "fetch-failed";
      console.warn(
        `[e2e-setup-law] ${pathName} attempt ${attempt}/5 failed: ${message}`,
      );
      await new Promise((resolve) => setTimeout(resolve, 1_000 * attempt));
    }
  }
  return false;
}

function resetDevUserRows(): void {
  execFileSync("pnpm", ["exec", "tsx", "scripts/e2e-reset-dev-user.ts"], {
    cwd: ROOT,
    stdio: "inherit",
    env: process.env,
  });
}

async function ensureDevCredentials(): Promise<void> {
  if (
    await postAuth("/api/auth/sign-in/email", {
      email: DEV_E2E_EMAIL,
      password: DEV_E2E_PASSWORD,
    })
  ) {
    console.info(`[e2e-setup-law] DEV user sign-in OK (${DEV_E2E_EMAIL})`);
    return;
  }
  if (
    await postAuth("/api/auth/sign-up/email", {
      name: DEV_E2E_NAME,
      email: DEV_E2E_EMAIL,
      password: DEV_E2E_PASSWORD,
    })
  ) {
    console.info(`[e2e-setup-law] DEV user registered (${DEV_E2E_EMAIL})`);
    return;
  }
  console.info(
    `[e2e-setup-law] DEV credentials mismatched — resetting user ${DEV_E2E_EMAIL}`,
  );
  resetDevUserRows();
  await waitForHealthy(60_000);
  if (
    !(await postAuth("/api/auth/sign-up/email", {
      name: DEV_E2E_NAME,
      email: DEV_E2E_EMAIL,
      password: DEV_E2E_PASSWORD,
    }))
  ) {
    throw new Error(
      `RG-LAW-DNS: unable to register deterministic DEV user ${DEV_E2E_EMAIL}`,
    );
  }
  if (
    !(await postAuth("/api/auth/sign-in/email", {
      email: DEV_E2E_EMAIL,
      password: DEV_E2E_PASSWORD,
    }))
  ) {
    throw new Error(
      `RG-LAW-DNS: registered DEV user but sign-in failed for ${DEV_E2E_EMAIL}`,
    );
  }
  console.info(`[e2e-setup-law] DEV user reset + sign-in OK (${DEV_E2E_EMAIL})`);
}

export default async function globalSetup(): Promise<void> {
  await waitForHealthy();
  await ensureDevCredentials();
}
