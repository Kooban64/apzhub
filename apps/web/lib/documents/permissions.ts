/**
 * UI-only Documents permission helpers.
 * Server remains authoritative — these only hide/disable controls.
 *
 * APZ-DOCUMENTS-NATIVE-001-N02: consume APZHUB session grants via hydration.
 * Never hardcode `document.*` as a UI default. Never map engine roles.
 *
 * Work-first: identity gates protect operator surfaces; they do not invent
 * a repository-centric product identity.
 */

export type DocumentsPermissionSource =
  readonly string[] | ReadonlySet<string> | undefined | null;

function asSet(source: DocumentsPermissionSource): ReadonlySet<string> {
  if (!source) return new Set();
  if (source instanceof Set) return source;
  return new Set(source);
}

function matches(granted: ReadonlySet<string>, required: string): boolean {
  if (granted.has("*") || granted.has("document.*")) return true;
  if (granted.has(required)) return true;
  const [ns, resource] = required.split(".");
  if (ns && resource && granted.has(`${ns}.${resource}.*`)) return true;
  return false;
}

export function hasDocumentsPermission(
  source: DocumentsPermissionSource,
  permission: string,
): boolean {
  return matches(asSet(source), permission);
}

export function canViewDocuments(source: DocumentsPermissionSource): boolean {
  return hasDocumentsPermission(source, "document.read");
}

export function canManageDocuments(source: DocumentsPermissionSource): boolean {
  return hasDocumentsPermission(source, "document.manage");
}

export function canAdminDocuments(source: DocumentsPermissionSource): boolean {
  return hasDocumentsPermission(source, "document.admin");
}
