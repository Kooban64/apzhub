/**
 * SearchEntityMapper — maps product entity drafts → CanonicalSearchEntity (APZSEARCH-009).
 * Never produces Meilisearch / provider documents.
 */

import type { SearchMetadata } from "@apzhub/search-contracts";
import { asSearchSourceId } from "@apzhub/search-contracts";

import type { SearchIntegrationContext } from "../context/search-integration-context";
import type {
  CanonicalSearchEntity,
  CanonicalSearchEntityInput,
} from "../entity/canonical-search-entity";
import { SearchEntityValidator } from "../validator/search-entity-validator";

/** Generic product draft — no engine fields. */
export type SearchEntityDraft = {
  readonly entityId: string;
  readonly entityType: string;
  readonly title: string;
  readonly summary?: string;
  readonly organisationId?: string;
  readonly classification?: CanonicalSearchEntityInput["classification"];
  readonly permissions?: readonly string[];
  readonly metadata?: Readonly<Record<string, string>>;
  readonly version?: string;
  readonly navigationTarget?: string;
  readonly sourceId?: string;
  readonly ownerUserId?: string;
  readonly keywords?: readonly string[];
  readonly createdAt?: string;
  readonly updatedAt?: string;
  readonly lifecycleState?: CanonicalSearchEntityInput["lifecycleState"];
};

export class SearchEntityMapper {
  constructor(private readonly validator = new SearchEntityValidator()) {}

  toInput(
    context: SearchIntegrationContext,
    draft: SearchEntityDraft,
  ): CanonicalSearchEntityInput {
    return {
      id: draft.entityId,
      entityType: draft.entityType,
      productId: context.productId,
      tenantId: context.tenantId,
      organisationId: draft.organisationId ?? context.organisationId,
      title: draft.title,
      summary: draft.summary,
      metadata: draft.metadata,
      classification: draft.classification,
      permissions: draft.permissions,
      version: draft.version,
      navigationTarget: draft.navigationTarget,
      sourceId: draft.sourceId,
      ownerUserId: draft.ownerUserId,
      keywords: draft.keywords,
      createdAt: draft.createdAt,
      updatedAt: draft.updatedAt,
      lifecycleState: draft.lifecycleState,
    };
  }

  map(
    context: SearchIntegrationContext,
    draft: SearchEntityDraft,
  ): CanonicalSearchEntity {
    return this.validator.assertValid(context, this.toInput(context, draft));
  }

  /**
   * Preview-only projection to platform SearchMetadata (canonical).
   * Does not index. Does not build provider documents.
   */
  toSearchMetadata(entity: CanonicalSearchEntity): SearchMetadata {
    return {
      entityType: entity.entityType,
      entityId: entity.id,
      title: entity.title,
      description: entity.summary,
      keywords: entity.keywords,
      productId: entity.productId,
      sourceId: asSearchSourceId(
        entity.sourceId ?? `${entity.productId}:${entity.entityType}`,
      ),
      tenantId: entity.tenantId,
      organisationId: entity.organisationId,
      classification: entity.classification,
      permissions: entity.permissions,
      ownerUserId: entity.ownerUserId,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      version: entity.version,
      navigationTarget: entity.navigationTarget,
      custom: entity.metadata,
    };
  }
}
