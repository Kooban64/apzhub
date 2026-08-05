"use client";

import { useSessionPermissions } from "@/components/session-authorization-provider";

import type { DocumentsPermissionSource } from "./permissions";

/**
 * Resolve Documents UI permissions from APZHUB session authorization.
 * Explicit override (tests / host injection) wins; otherwise session grants.
 * Never defaults to `document.*`.
 */
export function useDocumentsPermissions(
  override?: DocumentsPermissionSource,
): DocumentsPermissionSource {
  const sessionPermissions = useSessionPermissions();
  if (override !== undefined) {
    return override;
  }
  return sessionPermissions;
}
