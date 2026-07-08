import type { KnowledgeProvider } from "../provider/knowledge-provider";
import type { KnowledgeRegistrationIssue } from "../types/knowledge-diagnostics";
import type { KnowledgeSource } from "../types/knowledge-source";
import { KnowledgeRegistryValidationError } from "./registry-errors";

const SOURCE_ID_PATTERN = /^[a-z][a-z0-9.-]*$/;

const SOURCE_KINDS = new Set<KnowledgeSource["kind"]>([
  "registry-projection",
  "metadata-index",
  "session-store",
  "connector-api",
  "event-index",
  "semantic-index",
  "ai-provider",
]);

const SOURCE_TIERS = new Set<KnowledgeSource["tier"]>(["T0", "T1", "T2", "T3", "T4"]);

const SOURCE_STATUSES = new Set<KnowledgeSource["status"]>([
  "active",
  "planned",
  "disabled",
]);

const DOCUMENT_KINDS = new Set<KnowledgeSource["provides"][number]>([
  "command",
  "navigation",
  "capability",
  "workspace",
  "preference",
  "notification",
  "activity",
  "document",
  "project",
  "person",
  "custom",
]);

/** Validates knowledge source descriptor shape before registration. */
export function validateKnowledgeSource(source: KnowledgeSource): void {
  if (!source.id?.trim()) {
    throw new KnowledgeRegistryValidationError("Knowledge source id is required", "id");
  }

  if (!SOURCE_ID_PATTERN.test(source.id)) {
    throw new KnowledgeRegistryValidationError(
      `Knowledge source id "${source.id}" must use lowercase dot notation`,
      "id",
    );
  }

  if (!source.label?.trim()) {
    throw new KnowledgeRegistryValidationError(
      "Knowledge source label is required",
      "label",
    );
  }

  if (!SOURCE_KINDS.has(source.kind)) {
    throw new KnowledgeRegistryValidationError(
      `Invalid knowledge source kind "${String(source.kind)}"`,
      "kind",
    );
  }

  if (!SOURCE_TIERS.has(source.tier)) {
    throw new KnowledgeRegistryValidationError(
      `Invalid knowledge source tier "${String(source.tier)}"`,
      "tier",
    );
  }

  if (!SOURCE_STATUSES.has(source.status)) {
    throw new KnowledgeRegistryValidationError(
      `Invalid knowledge source status "${String(source.status)}"`,
      "status",
    );
  }

  if (!Number.isFinite(source.priority) || source.priority < 0) {
    throw new KnowledgeRegistryValidationError(
      "Knowledge source priority must be a finite number >= 0",
      "priority",
    );
  }

  if (!Array.isArray(source.provides) || source.provides.length === 0) {
    throw new KnowledgeRegistryValidationError(
      "Knowledge source must declare at least one provided document kind",
      "provides",
    );
  }

  for (const kind of source.provides) {
    if (!DOCUMENT_KINDS.has(kind)) {
      throw new KnowledgeRegistryValidationError(
        `Invalid provided document kind "${String(kind)}"`,
        "provides",
      );
    }
  }

  if (source.version !== undefined && !source.version.trim()) {
    throw new KnowledgeRegistryValidationError(
      "Knowledge source version must be non-empty when provided",
      "version",
    );
  }
}

/** Validates provider shape — does not invoke query(). */
export function validateKnowledgeProvider(provider: KnowledgeProvider): void {
  validateKnowledgeSource(provider.source);

  if (typeof provider.query !== "function") {
    throw new KnowledgeRegistryValidationError(
      "Knowledge provider must expose query() function",
      "query",
    );
  }
}

export function collectSourceValidationIssues(
  sources: readonly KnowledgeSource[],
): KnowledgeRegistrationIssue[] {
  const issues: KnowledgeRegistrationIssue[] = [];

  for (const source of sources) {
    try {
      validateKnowledgeSource(source);
    } catch (error) {
      if (error instanceof KnowledgeRegistryValidationError) {
        issues.push({
          code: "VALIDATION",
          sourceId: source.id,
          field: error.field,
          message: error.message,
        });
      } else {
        throw error;
      }
    }
  }

  return issues;
}

export function collectProviderValidationIssues(
  providers: readonly KnowledgeProvider[],
): KnowledgeRegistrationIssue[] {
  const issues: KnowledgeRegistrationIssue[] = [];

  for (const provider of providers) {
    try {
      validateKnowledgeProvider(provider);
    } catch (error) {
      if (error instanceof KnowledgeRegistryValidationError) {
        issues.push({
          code: "VALIDATION",
          sourceId: provider.source.id,
          field: error.field,
          message: error.message,
        });
      } else {
        throw error;
      }
    }
  }

  return issues;
}

export function collectDuplicateSourceIssues(
  sources: readonly KnowledgeSource[],
  existingIds: ReadonlySet<string>,
): KnowledgeRegistrationIssue[] {
  const issues: KnowledgeRegistrationIssue[] = [];
  const seen = new Set<string>();

  for (const source of sources) {
    if (seen.has(source.id) || existingIds.has(source.id)) {
      issues.push({
        code: "DUPLICATE_ID",
        sourceId: source.id,
        message: `Duplicate knowledge source id: ${source.id}`,
      });
    }
    seen.add(source.id);
  }

  return issues;
}

export function collectDuplicateProviderIssues(
  providers: readonly KnowledgeProvider[],
  existingIds: ReadonlySet<string>,
): KnowledgeRegistrationIssue[] {
  return collectDuplicateSourceIssues(
    providers.map((provider) => provider.source),
    existingIds,
  );
}
