/**
 * Reporting product search publication contract (APZSEARCH-009).
 * Contract declaration only — no adapter implementation.
 */

import type { ProductSearchPublicationContract } from "./contracts";

export const REPORTING_SEARCH_ENTITY_TYPES = [
  "report",
  "template",
  "dashboard",
] as const;

export const ReportingSearchPublicationContract: ProductSearchPublicationContract =
  {
    productId: "reporting",
    label: "Reporting",
    supportedEntityTypes: REPORTING_SEARCH_ENTITY_TYPES,
  };
