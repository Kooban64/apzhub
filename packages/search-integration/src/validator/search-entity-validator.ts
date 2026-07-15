/**
 * SearchEntityValidator — canonical entity validation (APZSEARCH-009).
 */

import {
  isSearchClassification,
  isSearchProductId,
  SearchDomainError,
} from "@apzhub/search-contracts";

import type { SearchIntegrationContext } from "../context/search-integration-context";
import type {
  CanonicalSearchEntity,
  CanonicalSearchEntityInput,
} from "../entity/canonical-search-entity";
import {
  asCanonicalSearchEntityId,
} from "../entity/canonical-search-entity";
import {
  isSearchEntityLifecycleState,
  type SearchEntityLifecycleState,
} from "../entity/lifecycle";

export type SearchEntityValidationIssue = {
  readonly field: string;
  readonly code: string;
  readonly message: string;
};

export type SearchEntityValidationResult = {
  readonly valid: boolean;
  readonly issues: readonly SearchEntityValidationIssue[];
  readonly entity?: CanonicalSearchEntity;
};

export class SearchEntityValidator {
  validate(
    context: SearchIntegrationContext,
    input: CanonicalSearchEntityInput,
  ): SearchEntityValidationResult {
    const issues: SearchEntityValidationIssue[] = [];

    if (!input.id || input.id.trim().length === 0) {
      issues.push({
        field: "id",
        code: "required",
        message: "canonical entity ID is required",
      });
    }
    if (!input.entityType || input.entityType.trim().length === 0) {
      issues.push({
        field: "entityType",
        code: "required",
        message: "entity type is required",
      });
    }
    if (!isSearchProductId(input.productId)) {
      issues.push({
        field: "productId",
        code: "invalid",
        message: "source product is not a declared SearchProductId",
      });
    } else if (input.productId !== context.productId) {
      issues.push({
        field: "productId",
        code: "product_mismatch",
        message: "entity productId must match SearchIntegrationContext.productId",
      });
    }
    if (!input.tenantId || input.tenantId.trim().length === 0) {
      issues.push({
        field: "tenantId",
        code: "required",
        message: "tenant is required",
      });
    } else if (input.tenantId !== context.tenantId) {
      issues.push({
        field: "tenantId",
        code: "tenant_mismatch",
        message: "entity tenantId must match SearchIntegrationContext.tenantId",
      });
    }
    if (
      context.organisationId &&
      input.organisationId &&
      input.organisationId !== context.organisationId
    ) {
      issues.push({
        field: "organisationId",
        code: "organisation_mismatch",
        message:
          "entity organisationId must match SearchIntegrationContext.organisationId",
      });
    }
    if (!input.title || input.title.trim().length === 0) {
      issues.push({
        field: "title",
        code: "required",
        message: "title is required",
      });
    }
    if (
      input.classification !== undefined &&
      !isSearchClassification(input.classification)
    ) {
      issues.push({
        field: "classification",
        code: "invalid",
        message: "classification is not a declared SearchClassification",
      });
    }
    if (
      input.lifecycleState !== undefined &&
      !isSearchEntityLifecycleState(input.lifecycleState)
    ) {
      issues.push({
        field: "lifecycleState",
        code: "invalid",
        message: "lifecycle state is not declared",
      });
    }
    if (input.metadata !== undefined) {
      for (const [key, value] of Object.entries(input.metadata)) {
        if (typeof value !== "string") {
          issues.push({
            field: `metadata.${key}`,
            code: "invalid",
            message: "metadata values must be strings (no provider payloads)",
          });
        }
        if (
          /meili|opensearch|elasticsearch|typesense|primaryKey|_geo/i.test(key)
        ) {
          issues.push({
            field: `metadata.${key}`,
            code: "provider_leakage",
            message: "provider-specific metadata keys are forbidden",
          });
        }
      }
    }

    if (issues.length > 0) {
      return { valid: false, issues };
    }

    const now = new Date().toISOString();
    const lifecycleState: SearchEntityLifecycleState =
      input.lifecycleState && isSearchEntityLifecycleState(input.lifecycleState)
        ? input.lifecycleState
        : "validated";

    const entity: CanonicalSearchEntity = {
      id: asCanonicalSearchEntityId(input.id.trim()),
      entityType: input.entityType.trim(),
      productId: input.productId,
      tenantId: input.tenantId,
      organisationId: input.organisationId ?? context.organisationId,
      title: input.title.trim(),
      summary: input.summary?.trim(),
      metadata: { ...(input.metadata ?? {}) },
      classification: input.classification ?? "internal",
      permissions: input.permissions ?? [...context.permissions],
      createdAt: input.createdAt ?? now,
      updatedAt: input.updatedAt ?? now,
      version: input.version ?? "1",
      lifecycleState,
      navigationTarget: input.navigationTarget,
      sourceId: input.sourceId,
      ownerUserId: input.ownerUserId ?? context.actorUserId,
      keywords: input.keywords,
    };

    return { valid: true, issues: [], entity };
  }

  assertValid(
    context: SearchIntegrationContext,
    input: CanonicalSearchEntityInput,
  ): CanonicalSearchEntity {
    const result = this.validate(context, input);
    if (!result.valid || !result.entity) {
      throw new SearchDomainError(
        "validation_failed",
        "Canonical search entity validation failed",
        {
          issues: result.issues,
          correlationId: context.correlationId,
        },
      );
    }
    return result.entity;
  }
}
