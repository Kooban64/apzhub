/**
 * PostgreSQL Catalogue adapters — APZQEP-120-S05.
 * PostgreSQL is the first durable persistence implementation for the Evidence Catalogue.
 */

export {
  CATALOGUE_STATES,
  deriveCatalogueState,
  type CatalogueState,
} from "./catalogue-state";
export { createPostgresEvidenceRepository } from "./evidence-repository";
export { createPostgresEvidenceRelationshipRepository } from "./relationship-repository";
export { createPostgresEvidenceAuditRepository } from "./audit-repository";
export { createPostgresEvidenceVersionRepository } from "./version-repository";
export { createPostgresEvidenceCollectionRepository } from "./collection-repository";
export { createPostgresEvidenceSetRepository } from "./set-repository";
export { createPostgresEvidenceAccessGrantRepository } from "./access-grant-repository";
export { createPostgresEvidenceUnitOfWork } from "./unit-of-work";
export {
  evidenceToRowValues,
  rowToPersistenceRecord,
  newVersionRowId,
} from "./row-mappers";
