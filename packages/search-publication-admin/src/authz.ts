import { SearchPublicationForbiddenError } from "./errors";
import {
  expandSearchPublicationPermissions,
  type SearchPublicationPermission,
} from "./permissions/catalogue";

export function assertSearchPublicationPermission(
  permissions: readonly string[],
  required: SearchPublicationPermission,
): void {
  const expanded = expandSearchPublicationPermissions(permissions);
  if (!expanded.has(required)) {
    throw new SearchPublicationForbiddenError(required);
  }
}

export function hasSearchPublicationPermission(
  permissions: readonly string[],
  required: SearchPublicationPermission,
): boolean {
  return expandSearchPublicationPermissions(permissions).has(required);
}
