/**
 * TestingSearchMetrics / Diagnostics / Logger / Error translator (APZSEARCH-013).
 */

import type { SearchPublicationOperation } from "@apzhub/search-integration";
import { SearchPublicationErrorTranslator } from "@apzhub/search-integration";
import { SearchDomainError } from "@apzhub/search-contracts";

import { SEARCH_TESTING_VERSION } from "../version";
import type { TestingSearchEntityType } from "../types/entity-types";
import type { TestingSearchValidationIssue } from "../validator/testing-search-entity-validator";

export type TestingSearchStatistics = {
  readonly byEntityType: Readonly<Record<string, number>>;
  readonly published: number;
  readonly updated: number;
  readonly removed: number;
  readonly validated: number;
  readonly previewed: number;
  readonly validationFailures: number;
  readonly publicationFailures: number;
};

export class TestingSearchMetrics {
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

  snapshot(): TestingSearchStatistics {
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

export type TestingSearchDiagnosticsSnapshot = {
  readonly adapterVersion: string;
  readonly productId: "testing";
  readonly supportedEntityTypes: readonly TestingSearchEntityType[];
  readonly statistics: TestingSearchStatistics;
  readonly lastOperation?: SearchPublicationOperation;
  readonly lastEntityType?: string;
  readonly lastCorrelationId?: string;
  readonly lastIssues?: readonly TestingSearchValidationIssue[];
  readonly mapperNotes: readonly string[];
  readonly checkedAt: string;
};

/**
 * Diagnostics store — tracks last operation and builds diagnostics snapshots.
 * Named TestingSearchDiagnostics per owner API.
 */
export class TestingSearchDiagnostics {
  private lastOperation?: SearchPublicationOperation;
  private lastEntityType?: string;
  private lastCorrelationId?: string;
  private lastIssues?: readonly TestingSearchValidationIssue[];

  touch(
    operation: SearchPublicationOperation,
    correlationId: string,
    entityType?: string,
    issues?: readonly TestingSearchValidationIssue[],
  ): void {
    this.lastOperation = operation;
    this.lastCorrelationId = correlationId;
    this.lastEntityType = entityType;
    this.lastIssues = issues;
  }

  build(
    statistics: TestingSearchStatistics,
    supportedEntityTypes: readonly TestingSearchEntityType[],
  ): TestingSearchDiagnosticsSnapshot {
    return {
      adapterVersion: SEARCH_TESTING_VERSION,
      productId: "testing",
      supportedEntityTypes,
      statistics,
      lastOperation: this.lastOperation,
      lastEntityType: this.lastEntityType,
      lastCorrelationId: this.lastCorrelationId,
      lastIssues: this.lastIssues,
      mapperNotes: [
        "Maps testing-contracts metadata models only — no binaries or report bodies",
        "Evidence publishes metadata only (never storageRef / checksum hex)",
        "Automation imports omit payloadFingerprint and checksum secrets",
        "Report publication is metadata-only (never RenderedReportOutput.body)",
        "Publishes via SearchIntegrationPublisher only",
      ],
      checkedAt: new Date().toISOString(),
    };
  }
}

/** Alias for TestingSearchDiagnostics store. */
export { TestingSearchDiagnostics as DiagnosticsStore };

export type TestingSearchLogLevel = "debug" | "info" | "warn" | "error";

export type TestingSearchLogEntry = {
  readonly level: TestingSearchLogLevel;
  readonly message: string;
  readonly correlationId?: string;
  readonly operation?: SearchPublicationOperation;
  readonly entityType?: string;
  readonly entityId?: string;
  readonly at: string;
};

export class TestingSearchLogger {
  private readonly entries: TestingSearchLogEntry[] = [];

  log(
    level: TestingSearchLogLevel,
    message: string,
    fields?: Omit<TestingSearchLogEntry, "level" | "message" | "at">,
  ): void {
    this.entries.push({
      level,
      message,
      ...fields,
      at: new Date().toISOString(),
    });
  }

  recent(limit = 50): readonly TestingSearchLogEntry[] {
    return this.entries.slice(-limit);
  }
}

export class TestingSearchErrorTranslator {
  private readonly base = new SearchPublicationErrorTranslator();

  translate(error: unknown): SearchDomainError {
    if (
      error instanceof Error &&
      /storage|checksum|credential|payload|secret|binary|body/i.test(error.message)
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
