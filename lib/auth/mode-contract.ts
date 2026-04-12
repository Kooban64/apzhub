import type { SessionSnapshot } from "@/lib/auth/session-types";

/** Single source for admin route and launcher: derived only from `availableModes`. */
export function adminModeAllowed(snapshot: SessionSnapshot): boolean {
  return snapshot.availableModes.includes("admin");
}

export function dualWorkspaceAdminMode(snapshot: SessionSnapshot): boolean {
  return snapshot.availableModes.includes("workspace") && snapshot.availableModes.includes("admin");
}

export function canAccessAdminFromSnapshot(snapshot: SessionSnapshot): boolean {
  return adminModeAllowed(snapshot);
}
