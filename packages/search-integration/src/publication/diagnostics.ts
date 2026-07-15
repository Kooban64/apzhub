/**
 * SearchPublicationDiagnostics — safe, redacted diagnostics (APZSEARCH-009).
 */

import type { SearchPublicationOperation } from "./result";

export type SearchPublicationDiagnostics = {
  readonly frameworkVersion: string;
  readonly sinkKind: string;
  readonly entityCount: number;
  readonly lastOperation?: SearchPublicationOperation;
  readonly lastCorrelationId?: string;
  readonly checkedAt: string;
  /** Never includes secrets, provider payloads, or raw entity bodies. */
  readonly notes: readonly string[];
};

export function createSearchPublicationDiagnostics(input: {
  readonly frameworkVersion: string;
  readonly sinkKind: string;
  readonly entityCount: number;
  readonly lastOperation?: SearchPublicationOperation;
  readonly lastCorrelationId?: string;
  readonly notes?: readonly string[];
}): SearchPublicationDiagnostics {
  return {
    frameworkVersion: input.frameworkVersion,
    sinkKind: input.sinkKind,
    entityCount: input.entityCount,
    lastOperation: input.lastOperation,
    lastCorrelationId: input.lastCorrelationId,
    checkedAt: new Date().toISOString(),
    notes: input.notes ?? [
      "Canonical publication journal only — Search Platform remains SoR for indexing",
      "No Meilisearch / provider coupling in this framework",
    ],
  };
}
