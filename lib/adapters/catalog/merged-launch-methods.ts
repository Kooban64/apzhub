import catalog from "@/lib/adapters/catalog/service-catalog.json";
import type { LaunchMethod } from "@/lib/launch/launch-method";
import { DEFAULT_SERVICE_LAUNCH_METHOD } from "@/lib/launch/service-launch-profile";
import type { WorkspaceServiceId } from "@/lib/workspace/workspace-config";

type CatalogFile = {
  launchMethods?: Partial<Record<WorkspaceServiceId, LaunchMethod>>;
};

/** Config-backed overrides merged with code defaults (Step 13 catalog). */
export function getMergedServiceLaunchMethods(): Record<WorkspaceServiceId, LaunchMethod> {
  const overrides = (catalog as CatalogFile).launchMethods ?? {};
  return { ...DEFAULT_SERVICE_LAUNCH_METHOD, ...overrides };
}
