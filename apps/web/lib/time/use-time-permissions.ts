"use client";

import { useSessionPermissions } from "@/components/session-authorization-provider";

import type { TimePermissionSource } from "./permissions";

/**
 * Resolve Time UI permissions from APZHUB session authorization.
 * Explicit override (tests / host injection) wins; otherwise session grants.
 * Never defaults to `time.*`.
 */
export function useTimePermissions(
  override?: TimePermissionSource,
): TimePermissionSource {
  const sessionPermissions = useSessionPermissions();
  if (override !== undefined) {
    return override;
  }
  return sessionPermissions;
}
