/**
 * Documents product search publication contract (APZSEARCH-009).
 * Contract declaration only — no adapter implementation.
 */

import type { ProductSearchPublicationContract } from "./contracts";

export const DOCUMENTS_SEARCH_ENTITY_TYPES = ["document", "folder", "tag"] as const;

export const DocumentsSearchPublicationContract: ProductSearchPublicationContract = {
  productId: "documents",
  label: "Documents",
  supportedEntityTypes: DOCUMENTS_SEARCH_ENTITY_TYPES,
};
