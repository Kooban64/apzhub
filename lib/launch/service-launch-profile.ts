import type { LaunchMethod } from "@/lib/launch/launch-method";
import type { WorkspaceServiceId } from "@/lib/workspace/workspace-config";

/** Tenant-level default launch transport per workspace service (mock Phase 7). */
export const DEFAULT_SERVICE_LAUNCH_METHOD: Record<WorkspaceServiceId, LaunchMethod> = {
  mail: "oidc",
  calendar: "jwt",
  reminders: "vault",
  drive: "external",
  chat: "external",
  plane: "external",
  zammad: "external",
  kimai: "external",
  kiwi: "external",
  paperless: "external",
  n8n: "external",
};
