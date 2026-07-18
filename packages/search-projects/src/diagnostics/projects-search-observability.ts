/**
 * ProjectsSearchMetrics / Diagnostics / Logger / Error translator (APZSEARCH-010).
 */

import type { SearchPublicationOperation } from "@apzhub/search-integration";
import { SearchPublicationErrorTranslator } from "@apzhub/search-integration";
import { SearchDomainError } from "@apzhub/search-contracts";

import { SEARCH_PROJECTS_VERSION } from "../version";
import type { ProjectsSearchEntityType } from "../types/entity-types";
import type { ProjectsSearchValidationIssue } from "../validator/projects-search-entity-validator";

export type ProjectsSearchStatistics = {
  readonly byEntityType: Readonly<Record<string, number>>;
  readonly published: number;
  readonly updated: number;
  readonly removed: number;
  readonly validated: number;
  readonly previewed: number;
  readonly validationFailures: number;
  readonly publicationFailures: number;
};

export class ProjectsSearchMetrics {
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

  snapshot(): ProjectsSearchStatistics {
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

export type ProjectsSearchDiagnostics = {
  readonly adapterVersion: string;
  readonly productId: "projects";
  readonly supportedEntityTypes: readonly ProjectsSearchEntityType[];
  readonly statistics: ProjectsSearchStatistics;
  readonly lastOperation?: SearchPublicationOperation;
  readonly lastEntityType?: string;
  readonly lastCorrelationId?: string;
  readonly lastIssues?: readonly ProjectsSearchValidationIssue[];
  readonly mapperNotes: readonly string[];
  readonly checkedAt: string;
};

export class ProjectsSearchDiagnosticsStore {
  private lastOperation?: SearchPublicationOperation;
  private lastEntityType?: string;
  private lastCorrelationId?: string;
  private lastIssues?: readonly ProjectsSearchValidationIssue[];

  touch(
    operation: SearchPublicationOperation,
    correlationId: string,
    entityType?: string,
    issues?: readonly ProjectsSearchValidationIssue[],
  ): void {
    this.lastOperation = operation;
    this.lastCorrelationId = correlationId;
    this.lastEntityType = entityType;
    this.lastIssues = issues;
  }

  build(
    statistics: ProjectsSearchStatistics,
    supportedEntityTypes: readonly ProjectsSearchEntityType[],
  ): ProjectsSearchDiagnostics {
    return {
      adapterVersion: SEARCH_PROJECTS_VERSION,
      productId: "projects",
      supportedEntityTypes,
      statistics,
      lastOperation: this.lastOperation,
      lastEntityType: this.lastEntityType,
      lastCorrelationId: this.lastCorrelationId,
      lastIssues: this.lastIssues,
      mapperNotes: [
        "Maps platform-service-contracts models only",
        "Plane / provider identifiers rejected",
        "Publishes via SearchIntegrationPublisher only",
      ],
      checkedAt: new Date().toISOString(),
    };
  }
}

export type ProjectsSearchLogLevel = "debug" | "info" | "warn" | "error";

export type ProjectsSearchLogEntry = {
  readonly level: ProjectsSearchLogLevel;
  readonly message: string;
  readonly correlationId?: string;
  readonly operation?: SearchPublicationOperation;
  readonly entityType?: string;
  readonly entityId?: string;
  readonly at: string;
};

export class ProjectsSearchLogger {
  private readonly entries: ProjectsSearchLogEntry[] = [];

  log(
    level: ProjectsSearchLogLevel,
    message: string,
    fields?: Omit<ProjectsSearchLogEntry, "level" | "message" | "at">,
  ): void {
    this.entries.push({
      level,
      message,
      ...fields,
      at: new Date().toISOString(),
    });
  }

  recent(limit = 50): readonly ProjectsSearchLogEntry[] {
    return this.entries.slice(-limit);
  }
}

export class ProjectsSearchErrorTranslator {
  private readonly base = new SearchPublicationErrorTranslator();

  translate(error: unknown): SearchDomainError {
    if (error instanceof Error && /Plane/.test(error.message)) {
      return new SearchDomainError("validation_failed", error.message);
    }
    if (error instanceof Error && /tenant mismatch/i.test(error.message)) {
      return new SearchDomainError("tenant_mismatch", error.message);
    }
    return this.base.translate(error);
  }
}
