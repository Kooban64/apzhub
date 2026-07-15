/**
 * Declared cross-product search publication contracts (APZSEARCH-009).
 */

export * from "./contracts";
export * from "./projects";
export * from "./support";
export * from "./documents";
export * from "./testing";
export * from "./reporting";

import type { ProductSearchPublicationContract } from "./contracts";
import { DocumentsSearchPublicationContract } from "./documents";
import { ProjectsSearchPublicationContract } from "./projects";
import { ReportingSearchPublicationContract } from "./reporting";
import { SupportSearchPublicationContract } from "./support";
import { TestingSearchPublicationContract } from "./testing";

export const DECLARED_PRODUCT_SEARCH_PUBLICATION_CONTRACTS: readonly ProductSearchPublicationContract[] =
  [
    ProjectsSearchPublicationContract,
    SupportSearchPublicationContract,
    DocumentsSearchPublicationContract,
    TestingSearchPublicationContract,
    ReportingSearchPublicationContract,
  ];

export function getProductSearchPublicationContract(
  productId: string,
): ProductSearchPublicationContract | undefined {
  return DECLARED_PRODUCT_SEARCH_PUBLICATION_CONTRACTS.find(
    (c) => c.productId === productId,
  );
}
