import type { PlatformRole } from "@/lib/auth/session-types";
import type { WorkspaceConfig, WorkspaceServiceId } from "@/lib/workspace/workspace-config";

/**
 * Three distinct launcher concepts (do not collapse):
 * - **allowed**: tenant may ever use this service.
 * - **visible**: shown as a tile in the launcher strip.
 * - **featured**: highlighted / pinned subset (must be visible).
 */
export function allowedServices(config: WorkspaceConfig): WorkspaceServiceId[] {
  return [...config.allowedServices];
}

export function effectiveLauncherVisible(config: WorkspaceConfig): WorkspaceServiceId[] {
  if (config.launcherVisibleServiceIds.length > 0) {
    return config.launcherVisibleServiceIds.filter((id) => config.allowedServices.includes(id));
  }
  return [...config.allowedServices];
}

/**
 * Launcher strip visibility: **superadmin** sees every tenant-allowed service as a tile
 * (even when `launcherVisibleServiceIds` is a curated subset for regular users).
 */
export function effectiveLauncherVisibleForSubject(
  config: WorkspaceConfig,
  platformRole: PlatformRole,
): WorkspaceServiceId[] {
  if (platformRole === "superadmin") {
    return [...config.allowedServices];
  }
  return effectiveLauncherVisible(config);
}

export function effectiveLauncherFeatured(config: WorkspaceConfig): WorkspaceServiceId[] {
  const visible = new Set(effectiveLauncherVisible(config));
  return config.launcherFeaturedServiceIds.filter(
    (id) => visible.has(id) && config.allowedServices.includes(id),
  );
}

export function isLauncherFeatured(config: WorkspaceConfig, id: WorkspaceServiceId): boolean {
  return effectiveLauncherFeatured(config).includes(id);
}
