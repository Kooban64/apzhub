/**
 * TIME-PR-05 — fail-closed Time API permission gate (session grants only).
 */

import type { PlatformApiRequestContext } from "../auth/with-platform-api-auth";
import { PlatformApiHttpError } from "../errors";

function hasPermission(granted: readonly string[], required: string): boolean {
  if (
    granted.includes(required) ||
    granted.includes("time.*") ||
    granted.includes("*")
  ) {
    return true;
  }
  const parts = required.split(".");
  for (let i = parts.length - 1; i >= 1; i -= 1) {
    const wildcard = `${parts.slice(0, i).join(".")}.*`;
    if (granted.includes(wildcard)) return true;
  }
  return false;
}

/** Require at least one of the listed Time permissions from the session. */
export function requireTimePermission(
  context: PlatformApiRequestContext,
  ...requiredAnyOf: readonly string[]
): void {
  const granted = context.serviceContext.permissions ?? [];
  const ok = requiredAnyOf.some((perm) => hasPermission(granted, perm));
  if (!ok) {
    throw new PlatformApiHttpError(403, {
      code: "FORBIDDEN",
      message: `Missing permission: ${requiredAnyOf.join(" | ")}`,
    });
  }
}
