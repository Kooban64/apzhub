/**
 * UI-only APZ Knowledge permission helpers.
 * Server remains authoritative — these only hide/disable controls.
 *
 * APZ-KNOWLEDGE-NATIVE-001-N02: consume APZHUB session grants via hydration.
 * Never hardcode `knowledge.*` as a UI default.
 *
 * Identity: Enterprise Organisational Memory.
 */

export type KnowledgePermissionSource =
  readonly string[] | ReadonlySet<string> | undefined | null;

function asSet(source: KnowledgePermissionSource): ReadonlySet<string> {
  if (!source) return new Set();
  if (source instanceof Set) return source;
  return new Set(source);
}

function matches(granted: ReadonlySet<string>, required: string): boolean {
  if (granted.has("*") || granted.has("knowledge.*")) return true;
  return granted.has(required);
}

export function hasKnowledgePermission(
  source: KnowledgePermissionSource,
  permission: string,
): boolean {
  return matches(asSet(source), permission);
}

/** Default product identity — enter organisational memory. */
export function canViewKnowledge(source: KnowledgePermissionSource): boolean {
  return (
    hasKnowledgePermission(source, "knowledge.view") ||
    hasKnowledgePermission(source, "knowledge.admin")
  );
}

export function canAdminKnowledge(source: KnowledgePermissionSource): boolean {
  return hasKnowledgePermission(source, "knowledge.admin");
}

/** Capture, curate and govern organisational memory (Wave A). */
export function canManageKnowledge(source: KnowledgePermissionSource): boolean {
  return (
    canAdminKnowledge(source) || hasKnowledgePermission(source, "knowledge.manage")
  );
}
