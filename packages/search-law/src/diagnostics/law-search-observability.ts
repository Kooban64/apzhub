/**
 * LawSearchMetrics / Diagnostics / Logger / Error translator (R12-SEARCH-02).
 */

import type { SearchPublicationOperation } from "@apzhub/search-integration";
import { SearchPublicationErrorTranslator } from "@apzhub/search-integration";
import { SearchDomainError } from "@apzhub/search-contracts";

import { SEARCH_LAW_VERSION } from "../version";
import type { LawSearchEntityType } from "../types/entity-types";
import type { LawSearchValidationIssue } from "../validator/law-search-entity-validator";

export type LawSearchStatistics = {
  readonly byEntityType: Readonly<Record<string, number>>;
  readonly published: number;
  readonly updated: number;
  readonly removed: number;
  readonly validated: number;
  readonly previewed: number;
  readonly validationFailures: number;
  readonly publicationFailures: number;
};

export class LawSearchMetrics {
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

  snapshot(): LawSearchStatistics {
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

export type LawSearchDiagnostics = {
  readonly adapterVersion: string;
  readonly productId: "law";
  readonly supportedEntityTypes: readonly LawSearchEntityType[];
  readonly statistics: LawSearchStatistics;
  readonly lastOperation?: SearchPublicationOperation;
  readonly lastEntityType?: string;
  readonly lastCorrelationId?: string;
  readonly lastIssues?: readonly LawSearchValidationIssue[];
  readonly mapperNotes: readonly string[];
  readonly checkedAt: string;
};

export class LawSearchDiagnosticsStore {
  private lastOperation?: SearchPublicationOperation;
  private lastEntityType?: string;
  private lastCorrelationId?: string;
  private lastIssues?: readonly LawSearchValidationIssue[];

  touch(
    operation: SearchPublicationOperation,
    correlationId: string,
    entityType?: string,
    issues?: readonly LawSearchValidationIssue[],
  ): void {
    this.lastOperation = operation;
    this.lastCorrelationId = correlationId;
    this.lastEntityType = entityType;
    this.lastIssues = issues;
  }

  build(
    statistics: LawSearchStatistics,
    supportedEntityTypes: readonly LawSearchEntityType[],
  ): LawSearchDiagnostics {
    return {
      adapterVersion: SEARCH_LAW_VERSION,
      productId: "law",
      supportedEntityTypes,
      statistics,
      lastOperation: this.lastOperation,
      lastEntityType: this.lastEntityType,
      lastCorrelationId: this.lastCorrelationId,
      lastIssues: this.lastIssues,
      mapperNotes: [
        "Maps legal-business-core Law models only",
        "External engine identifiers rejected",
        "Billing, trust, rates, and financial fields excluded (FIN-001 STOP)",
        "Document binaries and storage refs never published",
        "Publishes via SearchIntegrationPublisher only",
      ],
      checkedAt: new Date().toISOString(),
    };
  }
}

export { LawSearchDiagnosticsStore as DiagnosticsStore };

export type LawSearchLogLevel = "debug" | "info" | "warn" | "error";

export type LawSearchLogEntry = {
  readonly level: LawSearchLogLevel;
  readonly message: string;
  readonly correlationId?: string;
  readonly operation?: SearchPublicationOperation;
  readonly entityType?: string;
  readonly entityId?: string;
  readonly at: string;
};

export class LawSearchLogger {
  private readonly entries: LawSearchLogEntry[] = [];

  log(
    level: LawSearchLogLevel,
    message: string,
    fields?: Omit<LawSearchLogEntry, "level" | "message" | "at">,
  ): void {
    this.entries.push({
      level,
      message,
      ...fields,
      at: new Date().toISOString(),
    });
  }

  recent(limit = 50): readonly LawSearchLogEntry[] {
    return this.entries.slice(-limit);
  }
}

export class LawSearchErrorTranslator {
  private readonly base = new SearchPublicationErrorTranslator();

  translate(error: unknown): SearchDomainError {
    if (
      error instanceof Error &&
      /external engine|kimai|zammad|plane/i.test(error.message)
    ) {
      return new SearchDomainError("validation_failed", error.message);
    }
    if (error instanceof Error && /tenant mismatch/i.test(error.message)) {
      return new SearchDomainError("tenant_mismatch", error.message);
    }
    return this.base.translate(error);
  }
}
