import { handleGetSystemHealth } from "@apzhub/platform-security/server";

import { ensurePlatformRuntimeReady } from "@/lib/runtime-init";

export async function GET(): Promise<Response> {
  const bootstrap = await ensurePlatformRuntimeReady().catch(() => null);
  return handleGetSystemHealth({
    runtimeReady: bootstrap?.success ?? false,
    runtimeDiagnostics: bootstrap?.diagnostics
      ? {
          status: bootstrap.diagnostics.status,
          platformReady: bootstrap.diagnostics.platformReady,
          registryCount: bootstrap.diagnostics.registryCount,
          capabilityCount: bootstrap.diagnostics.capabilityCount,
        }
      : undefined,
  });
}
