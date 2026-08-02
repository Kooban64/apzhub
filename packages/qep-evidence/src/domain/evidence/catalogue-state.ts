/**
 * Catalogue lifecycle state — APZQEP-120-S05 / S06.
 * Catalogue state is separate from content/storage state.
 * When lifecycleGovernance.state is set, it is authoritative.
 */

import type { Evidence } from "./evidence";
import type { LifecycleGovernanceState } from "./lifecycle-governance";

export const CATALOGUE_STATES = [
  "ACTIVE",
  "RESTRICTED",
  "ARCHIVE_ELIGIBLE",
  "ARCHIVED",
  "SUPERSEDED",
  "DISPOSAL_ELIGIBLE",
  "LOGICALLY_DELETED",
  /** @deprecated Prefer LOGICALLY_DELETED — retained for S05 row compatibility. */
  "DELETED_LOGICALLY",
  "UNAVAILABLE",
] as const;

export type CatalogueState = (typeof CATALOGUE_STATES)[number];

/** Normalise legacy DELETED_LOGICALLY → LOGICALLY_DELETED for governance. */
export function normaliseCatalogueState(
  state: CatalogueState,
): LifecycleGovernanceState {
  if (state === "DELETED_LOGICALLY") return "LOGICALLY_DELETED";
  return state as LifecycleGovernanceState;
}

export function deriveCatalogueState(
  evidence: Pick<Evidence, "status"> & {
    readonly integrity?: Evidence["integrity"] | null;
    readonly lifecycleGovernance?: Evidence["lifecycleGovernance"] | null;
  },
): CatalogueState {
  if (evidence.lifecycleGovernance?.state) {
    const state = evidence.lifecycleGovernance.state;
    // Persist LOGICALLY_DELETED; keep DELETED_LOGICALLY readable as synonym.
    return state;
  }
  if (evidence.status === "disposed") return "LOGICALLY_DELETED";
  if (evidence.status === "archived") return "ARCHIVED";
  if (evidence.status === "quarantined") return "RESTRICTED";
  if (evidence.integrity?.verificationState === "content_missing") {
    return "UNAVAILABLE";
  }
  return "ACTIVE";
}
