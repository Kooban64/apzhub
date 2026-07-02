import path from "node:path";
import { fileURLToPath } from "node:url";

import type { BootstrapResult } from "@apzhub/platform-runtime/server";
import { Runtime } from "@apzhub/platform-runtime/server";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Monorepo workspace root resolved from apps/web/lib. */
export const WORKSPACE_ROOT = path.resolve(__dirname, "../../..");

let bootstrapPromise: Promise<BootstrapResult> | null = null;

export function ensurePlatformRuntimeReady(): Promise<BootstrapResult> {
  if (!bootstrapPromise) {
    bootstrapPromise = Runtime.bootstrap({
      workspaceRoot: WORKSPACE_ROOT,
      failFast: process.env.NODE_ENV === "production",
    });
  }

  return bootstrapPromise;
}

/** @internal Resets cached bootstrap promise for tests. */
export function _resetRuntimeInitForTests(): void {
  bootstrapPromise = null;
  Runtime._resetForTests();
}
