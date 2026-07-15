import path from "node:path";
import { fileURLToPath } from "node:url";

import { ensureEnvironmentValid } from "@apzhub/config";
import {
  ensurePlatformRuntimeReady as ensureCanonicalBootstrap,
  resetPlatformBootstrapForTests,
} from "@apzhub/platform-bootstrap/server";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Monorepo workspace root resolved from apps/web/lib. */
export const WORKSPACE_ROOT = path.resolve(__dirname, "../../..");

export function ensurePlatformEnvironmentValid() {
  if (process.env.NEXT_PHASE === "phase-production-build") {
    return;
  }

  return ensureEnvironmentValid({
    abortProcess: process.env.NODE_ENV === "production",
  });
}

export function ensurePlatformRuntimeReady() {
  ensurePlatformEnvironmentValid();
  return ensureCanonicalBootstrap(WORKSPACE_ROOT, {
    failFast: process.env.NODE_ENV === "production",
  });
}

/** @internal Resets cached bootstrap promise for tests. */
export function _resetRuntimeInitForTests(): void {
  resetPlatformBootstrapForTests();
}
