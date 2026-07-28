/**
 * APZHUB-ENG-0006 / RG-HEALTH-503 → RG-AUTH-SHELL
 * After webServer is ready: verify /api/health is 200 and ensure deterministic DEV credentials.
 */
import { config as loadEnv } from "dotenv";
import { execFileSync } from "node:child_process";
import path from "node:path";

loadEnv({ path: path.resolve(__dirname, "../../.env") });

export const DEV_E2E_EMAIL = "dev@apzhub.local";
export const DEV_E2E_PASSWORD = "DevPassword123!";
export const DEV_E2E_NAME = "Dev User";

const ROOT = path.resolve(__dirname, "../..");
const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3300";

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
          runtime?: { platformReady?: boolean };
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
          platformReady: body.runtime?.platformReady,
        })}`;
      }
    } catch (error) {
      last = error instanceof Error ? error.message : "fetch-failed";
    }
    await new Promise((resolve) => setTimeout(resolve, 1_500));
  }
  throw new Error(
    `RG-HEALTH-503: /api/health did not become healthy within ${timeoutMs}ms (${last})`,
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
          `[e2e-setup] ${pathName} HTTP ${response.status}: ${detail.slice(0, 200)}`,
        );
      }
      return response.ok;
    } catch (error) {
      const message = error instanceof Error ? error.message : "fetch-failed";
      console.warn(`[e2e-setup] ${pathName} attempt ${attempt}/5 failed: ${message}`);
      await new Promise((resolve) => setTimeout(resolve, 1_000 * attempt));
    }
  }
  return false;
}

async function signInEmail(): Promise<boolean> {
  return postAuth("/api/auth/sign-in/email", {
    email: DEV_E2E_EMAIL,
    password: DEV_E2E_PASSWORD,
  });
}

async function signUpEmail(): Promise<boolean> {
  return postAuth("/api/auth/sign-up/email", {
    name: DEV_E2E_NAME,
    email: DEV_E2E_EMAIL,
    password: DEV_E2E_PASSWORD,
  });
}

function resetDevUserRows(): void {
  execFileSync("pnpm", ["exec", "tsx", "scripts/e2e-reset-dev-user.ts"], {
    cwd: ROOT,
    stdio: "inherit",
    env: process.env,
  });
}

async function ensureDevCredentials(): Promise<void> {
  if (await signInEmail()) {
    console.info(`[e2e-setup] DEV user sign-in OK (${DEV_E2E_EMAIL})`);
    return;
  }
  if (await signUpEmail()) {
    console.info(`[e2e-setup] DEV user registered (${DEV_E2E_EMAIL})`);
    return;
  }
  console.info(
    `[e2e-setup] DEV credentials mismatched — resetting user ${DEV_E2E_EMAIL}`,
  );
  resetDevUserRows();
  await waitForHealthy(60_000);
  if (!(await signUpEmail())) {
    throw new Error(
      `RG-AUTH-SHELL: unable to register deterministic DEV user ${DEV_E2E_EMAIL}`,
    );
  }
  if (!(await signInEmail())) {
    throw new Error(
      `RG-AUTH-SHELL: registered DEV user but sign-in failed for ${DEV_E2E_EMAIL}`,
    );
  }
  console.info(`[e2e-setup] DEV user reset + sign-in OK (${DEV_E2E_EMAIL})`);
}

export default async function globalSetup(): Promise<void> {
  try {
    execFileSync("pnpm", ["db:seed"], {
      cwd: ROOT,
      stdio: "inherit",
      env: process.env,
    });
  } catch (error) {
    console.warn(
      "[e2e-setup] db:seed failed (continuing if roles already present):",
      error instanceof Error ? error.message : error,
    );
  }
  await waitForHealthy();
  await ensureDevCredentials();
}
