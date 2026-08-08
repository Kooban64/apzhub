import { permissionPatternMatches } from "@apzhub/platform-authorization";

import type { QuickActionDescriptor } from "./types";

export function userHasPermission(
  userPermissions: readonly string[],
  required: string,
): boolean {
  return userPermissions.some((granted) => permissionPatternMatches(granted, required));
}

/** Fail closed — only actions the caller is authorised to start. */
export function filterQuickActionsByPermissions(
  actions: readonly QuickActionDescriptor[],
  userPermissions: readonly string[],
): readonly QuickActionDescriptor[] {
  return actions.filter((action) =>
    userHasPermission(userPermissions, action.permission),
  );
}
