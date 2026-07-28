/**
 * TimeSearchMetrics / Diagnostics / Logger / Error translator (R12-SEARCH-01).
 */

import type { SearchPublicationOperation } from "@apzhub/search-integration";
import { SearchPublicationErrorTranslator } from "@apzhub/search-integration";
import { SearchDomainError } from "@apzhub/search-contracts";

import { SEARCH_TIME_VERSION } from "../version";
import type { TimeSearchEntityType } from "../types/entity-types";
import type { TimeSearchValidationIssue } from "../validator/time-search-entity-validator";

export type TimeSearchStatistics = {
  readonly byEntityType: Readonly<Record<string, number>>;
  readonly published: number;
  readonly updated: number;
  readonly removed: number;
  readonly validated: number;
  readonly previewed: number;
  readonly validationFailures: number;
  readonly publicationFailures: number;
};

export class TimeSearchMetrics {
  private readonly byEntityType = new Map<string, number>();
  private published = 0;
  private updated = 0;
  private removed = 0;
  private validated = 0;
  private previewed = 0;
  private validationFailures = 0;
  private publicationFailures = 0;

  record(
    operation: SearchPublicationOperation,
    ok: boolean,
    entityType?: string,
  ): void {
    if (entityType) {
      this.byEntityType.set(entityType, (this.byEntityType.get(entityType) ?? 0) + 1);
    }
    if (!ok) {
      if (operation === "validate") this.validationFailures += 1;
      else this.publicationFailures += 1;
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

  snapshot(): TimeSearchStatistics {
    return {
      byEntityType: Object.fromEntries(this.byEntityType),
      published: this.published,
      updated: this.updated,
      removed: this.removed,
      validated: this.validated,
      previewed: this.previewed,
      validationFailures: this.validationFailures,
      publicationFailures: this.publicationFailures,
    };
  }
}

export type TimeSearchDiagnostics = {
  readonly adapterVersion: string;
  readonly productId: "time";
  readonly supportedEntityTypes: readonly TimeSearchEntityType[];
  readonly statistics: TimeSearchStatistics;
  readonly lastOperation?: SearchPublicationOperation;
  readonly lastEntityType?: string;
  readonly lastCorrelationId?: string;
  readonly lastIssues?: readonly TimeSearchValidationIssue[];
  readonly mapperNotes: readonly string[];
  readonly checkedAt: string;
};

/** Diagnostics store — tracks last operation and builds TimeSearchDiagnostics. */
export class TimeSearchDiagnosticsStore {
  private lastOperation?: SearchPublicationOperation;
  private lastEntityType?: string;
  private lastCorrelationId?: string;
  private lastIssues?: readonly TimeSearchValidationIssue[];

  touch(
    operation: SearchPublicationOperation,
    correlationId: string,
    entityType?: string,
    issues?: readonly TimeSearchValidationIssue[],
  ): void {
    this.lastOperation = operation;
    this.lastCorrelationId = correlationId;
    this.lastEntityType = entityType;
    this.lastIssues = issues;
  }

  build(
    statistics: TimeSearchStatistics,
    supportedEntityTypes: readonly TimeSearchEntityType[],
  ): TimeSearchDiagnostics {
    return {
      adapterVersion: SEARCH_TIME_VERSION,
      productId: "time",
      supportedEntityTypes,
      statistics,
      lastOperation: this.lastOperation,
      lastEntityType: this.lastEntityType,
      lastCorrelationId: this.lastCorrelationId,
      lastIssues: this.lastIssues,
      mapperNotes: [
        "Maps platform-service-contracts Time models only",
        "Kimai / provider identifiers rejected",
        "Billing, rates, and financial fields excluded",
        "Publishes via SearchIntegrationPublisher only",
      ],
      checkedAt: new Date().toISOString(),
    };
  }
}

/** Alias for TimeSearchDiagnosticsStore. */
export { TimeSearchDiagnosticsStore as DiagnosticsStore };

export type TimeSearchLogLevel = "debug" | "info" | "warn" | "error";

export type TimeSearchLogEntry = {
  readonly level: TimeSearchLogLevel;
  readonly message: string;
  readonly correlationId?: string;
  readonly operation?: SearchPublicationOperation;
  readonly entityType?: string;
  readonly entityId?: string;
  readonly at: string;
};

export class TimeSearchLogger {
  private readonly entries: TimeSearchLogEntry[] = [];

  log(
    level: TimeSearchLogLevel,
    message: string,
    fields?: Omit<TimeSearchLogEntry, "level" | "message" | "at">,
  ): void {
    this.entries.push({
      level,
      message,
      ...fields,
      at: new Date().toISOString(),
    });
  }

  recent(limit = 50): readonly TimeSearchLogEntry[] {
    return this.entries.slice(-limit);
  }
}

export class TimeSearchErrorTranslator {
  private readonly base = new SearchPublicationErrorTranslator();

  translate(error: unknown): SearchDomainError {
    if (error instanceof Error && /Kimai/i.test(error.message)) {
      return new SearchDomainError("validation_failed", error.message);
    }
    if (error instanceof Error && /tenant mismatch/i.test(error.message)) {
      return new SearchDomainError("tenant_mismatch", error.message);
    }
    return this.base.translate(error);
  }
}
