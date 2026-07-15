/**
 * Projects searchable entity catalogue (APZSEARCH-010).
 * Source product is always `projects`.
 */

export const PROJECTS_SEARCH_ENTITY_TYPES = [
  "workspace",
  "project",
  "task",
  "sprint",
  "milestone",
  "module",
  "team",
] as const;

export type ProjectsSearchEntityType =
  (typeof PROJECTS_SEARCH_ENTITY_TYPES)[number];

export function isProjectsSearchEntityType(
  value: string,
): value is ProjectsSearchEntityType {
  return (PROJECTS_SEARCH_ENTITY_TYPES as readonly string[]).includes(value);
}

/** Reject Plane provisional / engine-native identifiers leaking into search. */
const PLANE_ID_LEAK =
  /_plane_|^(plane_|pln_)|::/i;

export function looksLikePlaneIdentifier(value: string): boolean {
  return PLANE_ID_LEAK.test(value);
}

export function assertPlatformEntityId(id: string, field = "id"): void {
  if (!id || id.trim().length === 0) {
    throw new Error(`${field} is required`);
  }
  if (looksLikePlaneIdentifier(id)) {
    throw new Error(
      `${field} must be a platform canonical id — Plane identifiers are forbidden`,
    );
  }
}
