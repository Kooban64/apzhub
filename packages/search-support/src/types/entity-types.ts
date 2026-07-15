/**
 * Support searchable entity catalogue (APZSEARCH-011).
 * Source product is always `support`.
 * Support Request ≠ Project Task; Support Article ≠ Project Comment.
 */

export const SUPPORT_SEARCH_ENTITY_TYPES = [
  "support_request",
  "support_article",
  "support_organisation",
  "support_group",
  "support_user",
] as const;

export type SupportSearchEntityType =
  (typeof SUPPORT_SEARCH_ENTITY_TYPES)[number];

export function isSupportSearchEntityType(
  value: string,
): value is SupportSearchEntityType {
  return (SUPPORT_SEARCH_ENTITY_TYPES as readonly string[]).includes(value);
}

/** Reject Zammad provisional / engine-native identifiers leaking into search. */
const ZAMMAD_ID_LEAK = /_zammad_|^(zammad_)/i;

export function looksLikeZammadIdentifier(value: string): boolean {
  return ZAMMAD_ID_LEAK.test(value) || value.includes("::");
}

export function assertPlatformEntityId(id: string, field = "id"): void {
  if (!id || id.trim().length === 0) {
    throw new Error(`${field} is required`);
  }
  if (looksLikeZammadIdentifier(id)) {
    throw new Error(
      `${field} must be a platform canonical id — Zammad identifiers are forbidden`,
    );
  }
}
