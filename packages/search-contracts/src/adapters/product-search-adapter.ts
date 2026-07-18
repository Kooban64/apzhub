/**
 * Product search adapter contracts (APZSEARCH-001).
 * Products remain System of Record. Adapters map product entities → SearchMetadata.
 * No implementations in this milestone.
 */

import type { SearchRequestContext } from "../common/context";
import type { SearchMetadata, SearchSource } from "../domain/search";
import type { SearchProductId } from "../enums/catalogue";

export type ProductSearchAdapterId = SearchProductId;

export type ProductSearchEntityRef = {
  readonly productId: SearchProductId;
  readonly entityType: string;
  readonly entityId: string;
  readonly tenantId: string;
  readonly organisationId?: string;
};

/**
 * Canonical adapter each product will implement in later milestones.
 * Never indexes proprietary engine payloads as SoR.
 */
export interface ProductSearchAdapter {
  readonly productId: SearchProductId;
  readonly label: string;
  describeSources(
    context: SearchRequestContext,
  ): Promise<readonly SearchSource[]> | readonly SearchSource[];
  /**
   * Maps a product entity reference to platform search metadata.
   * Must enforce tenant/org/permission awareness at the product service layer.
   */
  mapToSearchMetadata?(
    context: SearchRequestContext,
    ref: ProductSearchEntityRef,
  ): Promise<SearchMetadata | null> | SearchMetadata | null;
  /**
   * Lists entity refs eligible for future indexing (metadata identifiers only).
   */
  listIndexableEntityRefs?(
    context: SearchRequestContext,
    options?: { readonly limit?: number; readonly cursor?: string },
  ): Promise<{
    readonly items: readonly ProductSearchEntityRef[];
    readonly nextCursor?: string;
  }>;
}

export const DECLARED_PRODUCT_SEARCH_ADAPTERS: readonly ProductSearchAdapterId[] = [
  "projects",
  "support",
  "documents",
  "testing",
  "reporting",
  "workflow",
  "analytics",
  "identity",
  "administration",
] as const;

export function isDeclaredProductSearchAdapter(
  value: string,
): value is ProductSearchAdapterId {
  return (DECLARED_PRODUCT_SEARCH_ADAPTERS as readonly string[]).includes(value);
}
