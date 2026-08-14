import path from "node:path";
import { fileURLToPath } from "node:url";

import { ensureEnvironmentValid, ensureLocalSecretsLoaded } from "@apzhub/config";
import {
  ensurePlatformRuntimeReady as ensureCanonicalBootstrap,
  resetPlatformBootstrapForTests,
} from "@apzhub/platform-bootstrap/server";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Monorepo workspace root.
 * Prefer `APZHUB_WORKSPACE_ROOT` for standalone / NFT servers where
 * `import.meta.url` no longer sits under `apps/web/lib`.
 */
export const WORKSPACE_ROOT =
  process.env.APZHUB_WORKSPACE_ROOT?.trim() || path.resolve(__dirname, "../../..");

export function ensurePlatformEnvironmentValid() {
  if (process.env.NEXT_PHASE === "phase-production-build") {
    return;
  }

  ensureLocalSecretsLoaded({
    secretsDir: process.env.APZHUB_SECRETS_DIR?.trim() || undefined,
  });

  return ensureEnvironmentValid({
    abortProcess: process.env.NODE_ENV === "production",
  });
}

function resolveRuntimeFailFast(): boolean {
  const override = process.env.APZHUB_RUNTIME_FAIL_FAST?.trim().toLowerCase();
  if (override === "true") return true;
  if (override === "false") return false;
  return process.env.NODE_ENV === "production";
}

export function ensurePlatformRuntimeReady() {
  ensurePlatformEnvironmentValid();
  return ensureCanonicalBootstrap(WORKSPACE_ROOT, {
    failFast: resolveRuntimeFailFast(),
  });
}

/** @internal Resets cached bootstrap promise for tests. */
export function _resetRuntimeInitForTests(): void {
  resetPlatformBootstrapForTests();
}
