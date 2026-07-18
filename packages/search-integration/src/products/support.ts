/**
 * Support product search publication contract (APZSEARCH-009).
 * Contract declaration only — no adapter implementation.
 */

import type { ProductSearchPublicationContract } from "./contracts";

export const SUPPORT_SEARCH_ENTITY_TYPES = [
  "ticket",
  "article",
  "organization",
] as const;

export const SupportSearchPublicationContract: ProductSearchPublicationContract = {
  productId: "support",
  label: "Support",
  supportedEntityTypes: SUPPORT_SEARCH_ENTITY_TYPES,
};
