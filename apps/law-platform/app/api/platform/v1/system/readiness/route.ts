import { handleGetSystemReadiness } from "@apzhub/platform-security/server";

import { ensurePlatformRuntimeReady } from "@/lib/runtime-init";

export async function GET(): Promise<Response> {
  const bootstrap = await ensurePlatformRuntimeReady().catch(() => null);
  return handleGetSystemReadiness({ runtimeReady: bootstrap?.success ?? false });
}
