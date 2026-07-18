/**
 * SupportSearchMetrics / Diagnostics / Logger / Error translator (APZSEARCH-011).
 */

import type { SearchPublicationOperation } from "@apzhub/search-integration";
import { SearchPublicationErrorTranslator } from "@apzhub/search-integration";
import { SearchDomainError } from "@apzhub/search-contracts";

import { SEARCH_SUPPORT_VERSION } from "../version";
import type { SupportSearchEntityType } from "../types/entity-types";
import type { SupportSearchValidationIssue } from "../validator/support-search-entity-validator";

export type SupportSearchStatistics = {
  readonly byEntityType: Readonly<Record<string, number>>;
  readonly published: number;
  readonly updated: number;
  readonly removed: number;
  readonly validated: number;
  readonly previewed: number;
  readonly validationFailures: number;
  readonly publicationFailures: number;
};

export class SupportSearchMetrics {
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

  snapshot(): SupportSearchStatistics {
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

export type SupportSearchDiagnostics = {
  readonly adapterVersion: string;
  readonly productId: "support";
  readonly supportedEntityTypes: readonly SupportSearchEntityType[];
  readonly statistics: SupportSearchStatistics;
  readonly lastOperation?: SearchPublicationOperation;
  readonly lastEntityType?: string;
  readonly lastCorrelationId?: string;
  readonly lastIssues?: readonly SupportSearchValidationIssue[];
  readonly mapperNotes: readonly string[];
  readonly checkedAt: string;
};

/** Diagnostics store — tracks last operation and builds SupportSearchDiagnostics. */
export class SupportSearchDiagnosticsStore {
  private lastOperation?: SearchPublicationOperation;
  private lastEntityType?: string;
  private lastCorrelationId?: string;
  private lastIssues?: readonly SupportSearchValidationIssue[];

  touch(
    operation: SearchPublicationOperation,
    correlationId: string,
    entityType?: string,
    issues?: readonly SupportSearchValidationIssue[],
  ): void {
    this.lastOperation = operation;
    this.lastCorrelationId = correlationId;
    this.lastEntityType = entityType;
    this.lastIssues = issues;
  }

  build(
    statistics: SupportSearchStatistics,
    supportedEntityTypes: readonly SupportSearchEntityType[],
  ): SupportSearchDiagnostics {
    return {
      adapterVersion: SEARCH_SUPPORT_VERSION,
      productId: "support",
      supportedEntityTypes,
      statistics,
      lastOperation: this.lastOperation,
      lastEntityType: this.lastEntityType,
      lastCorrelationId: this.lastCorrelationId,
      lastIssues: this.lastIssues,
      mapperNotes: [
        "Maps platform-service-contracts Support models only",
        "Zammad / provider identifiers rejected",
        "Publishes via SearchIntegrationPublisher only",
      ],
      checkedAt: new Date().toISOString(),
    };
  }
}

/** Alias for SupportSearchDiagnosticsStore. */
export { SupportSearchDiagnosticsStore as DiagnosticsStore };

export type SupportSearchLogLevel = "debug" | "info" | "warn" | "error";

export type SupportSearchLogEntry = {
  readonly level: SupportSearchLogLevel;
  readonly message: string;
  readonly correlationId?: string;
  readonly operation?: SearchPublicationOperation;
  readonly entityType?: string;
  readonly entityId?: string;
  readonly at: string;
};

export class SupportSearchLogger {
  private readonly entries: SupportSearchLogEntry[] = [];

  log(
    level: SupportSearchLogLevel,
    message: string,
    fields?: Omit<SupportSearchLogEntry, "level" | "message" | "at">,
  ): void {
    this.entries.push({
      level,
      message,
      ...fields,
      at: new Date().toISOString(),
    });
  }

  recent(limit = 50): readonly SupportSearchLogEntry[] {
    return this.entries.slice(-limit);
  }
}

export class SupportSearchErrorTranslator {
  private readonly base = new SearchPublicationErrorTranslator();

  translate(error: unknown): SearchDomainError {
    if (error instanceof Error && /Zammad/i.test(error.message)) {
      return new SearchDomainError("validation_failed", error.message);
    }
    if (error instanceof Error && /tenant mismatch/i.test(error.message)) {
      return new SearchDomainError("tenant_mismatch", error.message);
    }
    return this.base.translate(error);
  }
}
