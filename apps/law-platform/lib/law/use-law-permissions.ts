"use client";

import { useSessionPermissions } from "../../components/session-authorization-provider";

import type { LawPermissionSource } from "./permissions";

/**
 * Resolve Law UI permissions from APZHUB session authorization.
 * Explicit override (tests) wins; otherwise hydrated session grants.
 * Never defaults to `legal.*` / `law.*`.
 */
export function useLawPermissions(override?: LawPermissionSource): LawPermissionSource {
  const sessionPermissions = useSessionPermissions();
  if (override !== undefined) {
    return override;
  }
  return sessionPermissions;
}
