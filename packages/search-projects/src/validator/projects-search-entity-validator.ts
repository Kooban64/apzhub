/**
 * ProjectsSearchEntityValidator — Projects-specific pre-publication checks (APZSEARCH-010).
 */

import type { SearchEntityDraft } from "@apzhub/search-integration";

import type { ProjectsSearchPublicationContext } from "../context/projects-search-publication-context";
import {
  isProjectsSearchEntityType,
  looksLikePlaneIdentifier,
  type ProjectsSearchEntityType,
} from "../types/entity-types";

export type ProjectsSearchValidationIssue = {
  readonly field: string;
  readonly code: string;
  readonly message: string;
};

export type ProjectsSearchValidationResult = {
  readonly valid: boolean;
  readonly issues: readonly ProjectsSearchValidationIssue[];
};

const MANDATORY_BY_TYPE: Readonly<
  Record<ProjectsSearchEntityType, readonly string[]>
> = {
  workspace: ["slug"],
  project: ["status", "identifier", "workspaceId"],
  task: ["status", "priority", "projectId"],
  sprint: ["status", "projectId"],
  milestone: ["status", "projectId"],
  module: ["status", "projectId"],
  team: [],
};

export class ProjectsSearchEntityValidator {
  validateDraft(
    context: ProjectsSearchPublicationContext,
    draft: SearchEntityDraft,
  ): ProjectsSearchValidationResult {
    const issues: ProjectsSearchValidationIssue[] = [];

    if (!draft.entityId || draft.entityId.trim().length === 0) {
      issues.push({
        field: "entityId",
        code: "required",
        message: "canonical entity ID is required",
      });
    } else if (looksLikePlaneIdentifier(draft.entityId)) {
      issues.push({
        field: "entityId",
        code: "plane_id_forbidden",
        message: "Plane identifiers must not be published",
      });
    }

    if (!isProjectsSearchEntityType(draft.entityType)) {
      issues.push({
        field: "entityType",
        code: "unsupported",
        message: `unsupported Projects search entity type: ${draft.entityType}`,
      });
    }

    if (!draft.title || draft.title.trim().length === 0) {
      issues.push({
        field: "title",
        code: "required",
        message: "title is required",
      });
    }

    if (!context.tenantId) {
      issues.push({
        field: "tenantId",
        code: "required",
        message: "tenant is required on publication context",
      });
    }

    if (!context.permissions) {
      issues.push({
        field: "permissions",
        code: "required",
        message: "permissions metadata is required",
      });
    }

    if (!draft.classification) {
      issues.push({
        field: "classification",
        code: "required",
        message: "classification is required",
      });
    }

    const metadata = draft.metadata ?? {};
    for (const [key, value] of Object.entries(metadata)) {
      if (looksLikePlaneIdentifier(value) || looksLikePlaneIdentifier(key)) {
        issues.push({
          field: `metadata.${key}`,
          code: "plane_id_forbidden",
          message: "Plane identifiers must not appear in metadata",
        });
      }
      if (/meili|opensearch|elasticsearch|typesense|primaryKey/i.test(key)) {
        issues.push({
          field: `metadata.${key}`,
          code: "provider_leakage",
          message: "provider-specific metadata keys are forbidden",
        });
      }
    }

    if (isProjectsSearchEntityType(draft.entityType)) {
      for (const key of MANDATORY_BY_TYPE[draft.entityType]) {
        if (!metadata[key] || String(metadata[key]).trim().length === 0) {
          issues.push({
            field: `metadata.${key}`,
            code: "required",
            message: `${key} is mandatory metadata for ${draft.entityType}`,
          });
        } else if (looksLikePlaneIdentifier(String(metadata[key]))) {
          issues.push({
            field: `metadata.${key}`,
            code: "plane_id_forbidden",
            message: `${key} must be a platform canonical id`,
          });
        }
      }
    }

    return { valid: issues.length === 0, issues };
  }
}
