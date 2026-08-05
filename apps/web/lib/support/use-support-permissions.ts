"use client";

import { useSessionPermissions } from "@/components/session-authorization-provider";

import type { SupportPermissionSource } from "./permissions";

/**
 * Resolve Support UI permissions from APZHUB session authorization.
 * Explicit override (tests / host injection) wins; otherwise session grants.
 * Never defaults to `support.*`.
 */
export function useSupportPermissions(
  override?: SupportPermissionSource,
): SupportPermissionSource {
  const sessionPermissions = useSessionPermissions();
  if (override !== undefined) {
    return override;
  }
  return sessionPermissions;
}
