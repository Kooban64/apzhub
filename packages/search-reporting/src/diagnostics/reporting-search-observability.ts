/**
 * ReportingSearchMetrics / Diagnostics / Logger / Error translator (APZSEARCH-014).
 */

import type { SearchPublicationOperation } from "@apzhub/search-integration";
import { SearchPublicationErrorTranslator } from "@apzhub/search-integration";
import { SearchDomainError } from "@apzhub/search-contracts";

import {
  REPORTING_CORE_DEPENDENCY_VERSION,
  SEARCH_REPORTING_VERSION,
} from "../version";
import type { ReportingSearchEntityType } from "../types/entity-types";
import type { ReportingSearchValidationIssue } from "../validator/reporting-search-entity-validator";

export type ReportingSearchStatistics = {
  readonly byEntityType: Readonly<Record<string, number>>;
  readonly published: number;
  readonly updated: number;
  readonly removed: number;
  readonly validated: number;
  readonly previewed: number;
  readonly validationFailures: number;
  readonly publicationFailures: number;
};

export class ReportingSearchMetrics {
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
      this.byEntityType.set(
        entityType,
        (this.byEntityType.get(entityType) ?? 0) + 1,
      );
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

  snapshot(): ReportingSearchStatistics {
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

export type ReportingSearchDiagnostics = {
  readonly adapterVersion: string;
  readonly productId: "reporting";
  readonly reportingCoreVersion: string;
  readonly supportedEntityTypes: readonly ReportingSearchEntityType[];
  readonly statistics: ReportingSearchStatistics;
  readonly lastOperation?: SearchPublicationOperation;
  readonly lastEntityType?: string;
  readonly lastCorrelationId?: string;
  readonly lastIssues?: readonly ReportingSearchValidationIssue[];
  readonly mapperNotes: readonly string[];
  readonly checkedAt: string;
};

/** Diagnostics store — tracks last operation and builds ReportingSearchDiagnostics. */
export class ReportingSearchDiagnosticsStore {
  private lastOperation?: SearchPublicationOperation;
  private lastEntityType?: string;
  private lastCorrelationId?: string;
  private lastIssues?: readonly ReportingSearchValidationIssue[];

  touch(
    operation: SearchPublicationOperation,
    correlationId: string,
    entityType?: string,
    issues?: readonly ReportingSearchValidationIssue[],
  ): void {
    this.lastOperation = operation;
    this.lastCorrelationId = correlationId;
    this.lastEntityType = entityType;
    this.lastIssues = issues;
  }

  build(
    statistics: ReportingSearchStatistics,
    supportedEntityTypes: readonly ReportingSearchEntityType[],
  ): ReportingSearchDiagnostics {
    return {
      adapterVersion: SEARCH_REPORTING_VERSION,
      productId: "reporting",
      reportingCoreVersion: REPORTING_CORE_DEPENDENCY_VERSION,
      supportedEntityTypes,
      statistics,
      lastOperation: this.lastOperation,
      lastEntityType: this.lastEntityType,
      lastCorrelationId: this.lastCorrelationId,
      lastIssues: this.lastIssues,
      mapperNotes: [
        "Maps reporting-contracts metadata models only — no rendered bodies",
        "Never publishes parametersJson values, checksum hex, or template section blueprints",
        "report_output_metadata derived from ReportGenerationMetadata (format/size/presence only)",
        "Publishes via SearchIntegrationPublisher only",
      ],
      checkedAt: new Date().toISOString(),
    };
  }
}

/** Alias for ReportingSearchDiagnosticsStore. */
export { ReportingSearchDiagnosticsStore as DiagnosticsStore };

export type ReportingSearchLogLevel = "debug" | "info" | "warn" | "error";

export type ReportingSearchLogEntry = {
  readonly level: ReportingSearchLogLevel;
  readonly message: string;
  readonly correlationId?: string;
  readonly operation?: SearchPublicationOperation;
  readonly entityType?: string;
  readonly entityId?: string;
  readonly at: string;
};

export class ReportingSearchLogger {
  private readonly entries: ReportingSearchLogEntry[] = [];

  log(
    level: ReportingSearchLogLevel,
    message: string,
    fields?: Omit<ReportingSearchLogEntry, "level" | "message" | "at">,
  ): void {
    this.entries.push({
      level,
      message,
      ...fields,
      at: new Date().toISOString(),
    });
  }

  recent(limit = 50): readonly ReportingSearchLogEntry[] {
    return this.entries.slice(-limit);
  }
}

export class ReportingSearchErrorTranslator {
  private readonly base = new SearchPublicationErrorTranslator();

  translate(error: unknown): SearchDomainError {
    if (
      error instanceof Error &&
      /parametersJson|checksum|rendered|content leakage|credential/i.test(
        error.message,
      )
    ) {
      return new SearchDomainError("validation_failed", error.message);
    }
    if (error instanceof Error && /classification/i.test(error.message)) {
      return new SearchDomainError("validation_failed", error.message);
    }
    if (error instanceof Error && /tenant mismatch/i.test(error.message)) {
      return new SearchDomainError("tenant_mismatch", error.message);
    }
    return this.base.translate(error);
  }
}
