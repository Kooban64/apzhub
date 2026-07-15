import type { BootstrapResult } from "@apzhub/platform-runtime/server";
import { Runtime } from "@apzhub/platform-runtime/server";

import type { BootstrapPackageDiagnostics, PlatformBootstrapOptions } from "./types";

const bootstrapCache = new Map<string, Promise<BootstrapResult>>();

function cacheKey(workspaceRoot: string, options: PlatformBootstrapOptions): string {
  return `${workspaceRoot}::${options.failFast === true ? "fail-fast" : "tolerant"}`;
}

/**
 * Canonical Platform Runtime bootstrap for all APZHUB application hosts.
 * Caches by workspace root and fail-fast mode.
 */
export function ensurePlatformRuntimeReady(
  workspaceRoot: string,
  options: PlatformBootstrapOptions = {},
): Promise<BootstrapResult> {
  const key = cacheKey(workspaceRoot, options);
  const existing = bootstrapCache.get(key);
  if (existing) {
    return existing;
  }

  const failFast = options.failFast ?? process.env.NODE_ENV === "production";
  const promise = Runtime.bootstrap({
    workspaceRoot,
    failFast,
  });
  bootstrapCache.set(key, promise);
  return promise;
}

export function getBootstrapPackageDiagnostics(
  workspaceRoot: string,
  bootstrap: BootstrapResult | null,
): BootstrapPackageDiagnostics {
  return {
    package: "@apzhub/platform-bootstrap",
    version: "0.1.0",
    canonical: true,
    workspaceRootConfigured: workspaceRoot.length > 0,
    runtimeReady: bootstrap?.success ?? false,
    runtimeStatus: bootstrap?.diagnostics.status,
  };
}

/** @internal Resets cached bootstrap promises for tests. */
export function resetPlatformBootstrapForTests(): void {
  bootstrapCache.clear();
  Runtime._resetForTests();
}
