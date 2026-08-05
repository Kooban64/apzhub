"use client";

import { useSessionPermissions } from "@/components/session-authorization-provider";

import type { ProjectsPermissionSource } from "./permissions";

/**
 * Resolve Projects UI permissions from APZHUB session authorization.
 * Explicit override (tests / host injection) wins; otherwise session grants.
 * Never defaults to `projects.*`.
 */
export function useProjectsPermissions(
  override?: ProjectsPermissionSource,
): ProjectsPermissionSource {
  const sessionPermissions = useSessionPermissions();
  if (override !== undefined) {
    return override;
  }
  return sessionPermissions;
}
