/**
 * SearchPublicationMetrics — in-process counters (APZSEARCH-009).
 * No exporters / workers.
 */

import type { SearchPublicationOperation } from "./result";

export type SearchPublicationStatistics = {
  readonly published: number;
  readonly updated: number;
  readonly removed: number;
  readonly validated: number;
  readonly previewed: number;
  readonly failures: number;
  readonly activeEntities: number;
};

export class SearchPublicationMetrics {
  private published = 0;
  private updated = 0;
  private removed = 0;
  private validated = 0;
  private previewed = 0;
  private failures = 0;

  record(operation: SearchPublicationOperation, ok: boolean): void {
    if (!ok) {
      this.failures += 1;
      return;
    }
    switch (operation) {
      case "publish":
        this.published += 1;
        break;
      case "update":
        this.updated += 1;
        break;
      case "remove":
        this.removed += 1;
        break;
      case "validate":
        this.validated += 1;
        break;
      case "preview":
        this.previewed += 1;
        break;
      default:
        break;
    }
  }

  snapshot(activeEntities: number): SearchPublicationStatistics {
    return {
      published: this.published,
      updated: this.updated,
      removed: this.removed,
      validated: this.validated,
      previewed: this.previewed,
      failures: this.failures,
      activeEntities,
    };
  }
}
