/**
 * Catalogue lifecycle state — APZQEP-120-S05.
 * Logical catalogue state is separate from content/storage state.
 */

import type { Evidence } from "./evidence";

export const CATALOGUE_STATES = [
  "ACTIVE",
  "UNAVAILABLE",
  "ARCHIVED",
  "SUPERSEDED",
  "RESTRICTED",
  "DELETED_LOGICALLY",
] as const;

export type CatalogueState = (typeof CATALOGUE_STATES)[number];

export function deriveCatalogueState(
  evidence: Pick<Evidence, "status"> & {
    readonly integrity?: Evidence["integrity"] | null;
  },
): CatalogueState {
  if (evidence.status === "disposed") return "DELETED_LOGICALLY";
  if (evidence.status === "archived") return "ARCHIVED";
  if (evidence.status === "quarantined") return "RESTRICTED";
  if (evidence.integrity?.verificationState === "content_missing") {
    return "UNAVAILABLE";
  }
  return "ACTIVE";
}
