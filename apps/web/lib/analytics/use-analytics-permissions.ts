"use client";

import { useSessionPermissions } from "@/components/session-authorization-provider";

import type { AnalyticsPermissionSource } from "./permissions";

/**
 * Resolve Analytics UI permissions from APZHUB session authorization.
 * Explicit override (tests / host injection) wins; otherwise session grants.
 * Never defaults to `analytics.*`.
 */
export function useAnalyticsPermissions(
  override?: AnalyticsPermissionSource,
): AnalyticsPermissionSource {
  const sessionPermissions = useSessionPermissions();
  if (override !== undefined) {
    return override;
  }
  return sessionPermissions;
}
