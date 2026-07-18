/**
 * APZ TCMS (testing) product search publication contract (APZSEARCH-009).
 * Contract declaration only — no adapter implementation.
 */

import type { ProductSearchPublicationContract } from "./contracts";

export const TESTING_SEARCH_ENTITY_TYPES = [
  "test_case",
  "test_run",
  "requirement",
  "defect",
] as const;

export const TestingSearchPublicationContract: ProductSearchPublicationContract = {
  productId: "testing",
  label: "APZ TCMS",
  supportedEntityTypes: TESTING_SEARCH_ENTITY_TYPES,
};
