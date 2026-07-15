/**
 * DocumentsSearchMetrics / Diagnostics / Logger / Error translator (APZSEARCH-012).
 */

import type { SearchPublicationOperation } from "@apzhub/search-integration";
import { SearchPublicationErrorTranslator } from "@apzhub/search-integration";
import { SearchDomainError } from "@apzhub/search-contracts";

import { SEARCH_DOCUMENTS_VERSION } from "../version";
import type { DocumentsSearchEntityType } from "../types/entity-types";
import type { DocumentsSearchValidationIssue } from "../validator/documents-search-entity-validator";

export type DocumentsSearchStatistics = {
  readonly byEntityType: Readonly<Record<string, number>>;
  readonly published: number;
  readonly updated: number;
  readonly removed: number;
  readonly validated: number;
  readonly previewed: number;
  readonly validationFailures: number;
  readonly publicationFailures: number;
};

export class DocumentsSearchMetrics {
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

  snapshot(): DocumentsSearchStatistics {
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

export type DocumentsSearchDiagnostics = {
  readonly adapterVersion: string;
  readonly productId: "documents";
  readonly supportedEntityTypes: readonly DocumentsSearchEntityType[];
  readonly statistics: DocumentsSearchStatistics;
  readonly lastOperation?: SearchPublicationOperation;
  readonly lastEntityType?: string;
  readonly lastCorrelationId?: string;
  readonly lastIssues?: readonly DocumentsSearchValidationIssue[];
  readonly mapperNotes: readonly string[];
  readonly checkedAt: string;
};

/** Diagnostics store — tracks last operation and builds DocumentsSearchDiagnostics. */
export class DocumentsSearchDiagnosticsStore {
  private lastOperation?: SearchPublicationOperation;
  private lastEntityType?: string;
  private lastCorrelationId?: string;
  private lastIssues?: readonly DocumentsSearchValidationIssue[];

  touch(
    operation: SearchPublicationOperation,
    correlationId: string,
    entityType?: string,
    issues?: readonly DocumentsSearchValidationIssue[],
  ): void {
    this.lastOperation = operation;
    this.lastCorrelationId = correlationId;
    this.lastEntityType = entityType;
    this.lastIssues = issues;
  }

  build(
    statistics: DocumentsSearchStatistics,
    supportedEntityTypes: readonly DocumentsSearchEntityType[],
  ): DocumentsSearchDiagnostics {
    return {
      adapterVersion: SEARCH_DOCUMENTS_VERSION,
      productId: "documents",
      supportedEntityTypes,
      statistics,
      lastOperation: this.lastOperation,
      lastEntityType: this.lastEntityType,
      lastCorrelationId: this.lastCorrelationId,
      lastIssues: this.lastIssues,
      mapperNotes: [
        "Maps document-contracts metadata models only — no binary payloads",
        "Primary document publishes with current-version metadata; optional document_version entities",
        "Storage refs, checksum hex, signed URLs, and credentials are rejected",
        "Publishes via SearchIntegrationPublisher only",
      ],
      checkedAt: new Date().toISOString(),
    };
  }
}

/** Alias for DocumentsSearchDiagnosticsStore. */
export { DocumentsSearchDiagnosticsStore as DiagnosticsStore };

export type DocumentsSearchLogLevel = "debug" | "info" | "warn" | "error";

export type DocumentsSearchLogEntry = {
  readonly level: DocumentsSearchLogLevel;
  readonly message: string;
  readonly correlationId?: string;
  readonly operation?: SearchPublicationOperation;
  readonly entityType?: string;
  readonly entityId?: string;
  readonly at: string;
};

export class DocumentsSearchLogger {
  private readonly entries: DocumentsSearchLogEntry[] = [];

  log(
    level: DocumentsSearchLogLevel,
    message: string,
    fields?: Omit<DocumentsSearchLogEntry, "level" | "message" | "at">,
  ): void {
    this.entries.push({
      level,
      message,
      ...fields,
      at: new Date().toISOString(),
    });
  }

  recent(limit = 50): readonly DocumentsSearchLogEntry[] {
    return this.entries.slice(-limit);
  }
}

export class DocumentsSearchErrorTranslator {
  private readonly base = new SearchPublicationErrorTranslator();

  translate(error: unknown): SearchDomainError {
    if (error instanceof Error && /storage|checksum|credential/i.test(error.message)) {
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
