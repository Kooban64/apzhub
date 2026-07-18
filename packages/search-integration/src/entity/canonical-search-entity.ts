/**
 * Canonical searchable entity — products publish only this shape (APZSEARCH-009).
 * No provider-specific fields. No Meilisearch documents.
 */

import type { SearchClassification, SearchProductId } from "@apzhub/search-contracts";

import type { SearchEntityLifecycleState } from "./lifecycle";

export type CanonicalSearchEntityId = string & {
  readonly __brand: "CanonicalSearchEntityId";
};

export function asCanonicalSearchEntityId(value: string): CanonicalSearchEntityId {
  if (!value || value.trim().length === 0) {
    throw new Error("invalid CanonicalSearchEntityId");
  }
  return value as CanonicalSearchEntityId;
}

/**
 * Platform-owned searchable entity published by a product.
 * Products never construct provider documents or indexes.
 */
export type CanonicalSearchEntity = {
  readonly id: CanonicalSearchEntityId;
  readonly entityType: string;
  readonly productId: SearchProductId;
  readonly tenantId: string;
  readonly organisationId?: string;
  readonly title: string;
  readonly summary?: string;
  readonly metadata: Readonly<Record<string, string>>;
  readonly classification: SearchClassification;
  readonly permissions: readonly string[];
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly version: string;
  readonly lifecycleState: SearchEntityLifecycleState;
  /** Optional Soft navigation target — platform URI / deep link, never engine URLs. */
  readonly navigationTarget?: string;
  readonly sourceId?: string;
  readonly ownerUserId?: string;
  readonly keywords?: readonly string[];
};

/** Input for publish / update before validation fills defaults. */
export type CanonicalSearchEntityInput = {
  readonly id: string;
  readonly entityType: string;
  readonly productId: SearchProductId;
  readonly tenantId: string;
  readonly organisationId?: string;
  readonly title: string;
  readonly summary?: string;
  readonly metadata?: Readonly<Record<string, string>>;
  readonly classification?: SearchClassification;
  readonly permissions?: readonly string[];
  readonly createdAt?: string;
  readonly updatedAt?: string;
  readonly version?: string;
  readonly lifecycleState?: SearchEntityLifecycleState;
  readonly navigationTarget?: string;
  readonly sourceId?: string;
  readonly ownerUserId?: string;
  readonly keywords?: readonly string[];
};
