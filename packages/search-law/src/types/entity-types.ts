/**
 * Law searchable entity catalogue (R12-SEARCH-02).
 * Source product is always `law`.
 * Law Matter ≠ Projects Task; Law Document ≠ APZ Documents Document.
 * Financial / trust / billing entities are never published (FIN-001 STOP).
 */

export const LAW_SEARCH_ENTITY_TYPES = [
  "law_matter",
  "law_client",
  "law_document",
  "law_task",
  "law_knowledge_article",
] as const;

export type LawSearchEntityType = (typeof LAW_SEARCH_ENTITY_TYPES)[number];

export function isLawSearchEntityType(value: string): value is LawSearchEntityType {
  return (LAW_SEARCH_ENTITY_TYPES as readonly string[]).includes(value);
}

/** Reject OSS-engine / provisional identifiers leaking into Law search publication. */
const EXTERNAL_ENGINE_ID_LEAK = /_kimai_|_zammad_|_plane_|^(kimai_|zammad_|plane_)/i;

export function looksLikeExternalEngineIdentifier(value: string): boolean {
  return EXTERNAL_ENGINE_ID_LEAK.test(value) || value.includes("::");
}

export function assertPlatformEntityId(id: string, field = "id"): void {
  if (!id || id.trim().length === 0) {
    throw new Error(`${field} is required`);
  }
  if (looksLikeExternalEngineIdentifier(id)) {
    throw new Error(
      `${field} must be a platform canonical id — external engine identifiers are forbidden`,
    );
  }
}
