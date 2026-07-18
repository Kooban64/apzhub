/**
 * Projects product search publication contract (APZSEARCH-009).
 * Contract declaration only — no adapter implementation.
 */

import type { ProductSearchPublicationContract } from "./contracts";

export const PROJECTS_SEARCH_ENTITY_TYPES = [
  "project",
  "issue",
  "cycle",
  "module",
] as const;

export const ProjectsSearchPublicationContract: ProductSearchPublicationContract = {
  productId: "projects",
  label: "Projects",
  supportedEntityTypes: PROJECTS_SEARCH_ENTITY_TYPES,
};
