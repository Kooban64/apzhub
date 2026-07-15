/**
 * Product publication contracts only — no product adapters (APZSEARCH-009).
 */

import type {
  ProductSearchAdapter,
  SearchProductId,
  SearchRequestContext,
  SearchSource,
} from "@apzhub/search-contracts";

import type { SearchEntityDraft } from "../mapper/search-entity-mapper";

/**
 * Contract each product implements in a later milestone.
 * Products map domain entities → SearchEntityDraft only.
 * Never touch Meilisearch, indexes, or SearchIndexedDocument.
 */
export interface ProductSearchPublicationContract {
  readonly productId: SearchProductId;
  readonly label: string;
  readonly supportedEntityTypes: readonly string[];
  /**
   * Declares searchable sources for the product (metadata only).
   * Implementations deferred — contracts only in APZSEARCH-009.
   */
  describeSources?(
    context: SearchRequestContext,
  ): Promise<readonly SearchSource[]> | readonly SearchSource[];
  /**
   * Maps a product domain entity into a canonical draft for publication.
   * Implementations deferred — contracts only in APZSEARCH-009.
   */
  toSearchEntityDraft?(
    context: SearchRequestContext,
    entity: unknown,
  ): Promise<SearchEntityDraft> | SearchEntityDraft;
}

/** Narrow ProductSearchAdapter markers for alignment with search-contracts. */
export type ProductSearchAdapterContract = Pick<
  ProductSearchAdapter,
  "productId" | "label" | "describeSources"
>;

export const CROSS_PRODUCT_SEARCH_PRODUCTS = [
  "projects",
  "support",
  "documents",
  "testing",
  "reporting",
] as const satisfies readonly SearchProductId[];

export type CrossProductSearchProductId =
  (typeof CROSS_PRODUCT_SEARCH_PRODUCTS)[number];

export function isCrossProductSearchProductId(
  value: string,
): value is CrossProductSearchProductId {
  return (CROSS_PRODUCT_SEARCH_PRODUCTS as readonly string[]).includes(value);
}
