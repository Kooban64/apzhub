/**
 * Time searchable entity catalogue (R12-SEARCH-01).
 * Source product is always `time`.
 * Time Project ≠ APZ Projects Project; Time Entry ≠ Support Request.
 */

export const TIME_SEARCH_ENTITY_TYPES = [
  "time_entry",
  "time_activity",
  "time_customer",
  "time_project",
  "time_tag",
] as const;

export type TimeSearchEntityType = (typeof TIME_SEARCH_ENTITY_TYPES)[number];

export function isTimeSearchEntityType(value: string): value is TimeSearchEntityType {
  return (TIME_SEARCH_ENTITY_TYPES as readonly string[]).includes(value);
}

/** Reject Kimai provisional / engine-native identifiers leaking into search. */
const KIMAI_ID_LEAK = /_kimai_|^(kimai_)/i;

export function looksLikeKimaiIdentifier(value: string): boolean {
  return KIMAI_ID_LEAK.test(value) || value.includes("::");
}

export function assertPlatformEntityId(id: string, field = "id"): void {
  if (!id || id.trim().length === 0) {
    throw new Error(`${field} is required`);
  }
  if (looksLikeKimaiIdentifier(id)) {
    throw new Error(
      `${field} must be a platform canonical id — Kimai identifiers are forbidden`,
    );
  }
}
