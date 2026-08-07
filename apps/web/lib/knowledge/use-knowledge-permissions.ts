"use client";

import { useSessionPermissions } from "@/components/session-authorization-provider";

import type { KnowledgePermissionSource } from "./permissions";

/**
 * Resolve Knowledge UI permissions from APZHUB session authorization.
 * Explicit override (tests / host injection) wins; otherwise session grants.
 * Never defaults to `knowledge.*`.
 */
export function useKnowledgePermissions(
  override?: KnowledgePermissionSource,
): KnowledgePermissionSource {
  const sessionPermissions = useSessionPermissions();
  if (override !== undefined) {
    return override;
  }
  return sessionPermissions;
}
