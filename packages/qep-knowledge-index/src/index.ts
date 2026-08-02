export {
  QEP_KNOWLEDGE_INDEX_VERSION,
  QEP_KNOWLEDGE_INDEX_PROJECTION_VERSION,
} from "./version";

export {
  KNOWLEDGE_ENTITY_KINDS,
  type KnowledgeEntityKind,
  type KnowledgeProjectionStatus,
  type KnowledgeIndexDocument,
  type ProjectionDefinition,
} from "./domain/types";

export {
  createInMemoryProjectionRepository,
  type ProjectionRepository,
  type InMemoryProjectionRepository,
} from "./projection/repository";

export {
  createProjectionRegistry,
  EVIDENCE_PROJECTION_DEFINITION,
  SUITE_PROJECTION_DEFINITION,
  EXECUTION_PLAN_PROJECTION_DEFINITION,
  EXECUTION_SESSION_PROJECTION_DEFINITION,
  DEFECT_PROJECTION_DEFINITION,
  REQUIREMENT_PROJECTION_DEFINITION,
  DOCUMENT_PROJECTION_DEFINITION,
  type ProjectionRegistry,
} from "./projection/registry";

export { buildEvidenceProjection } from "./projection/evidence-builder";
export { buildSuiteProjection } from "./projection/suite-builder";
export { buildExecutionPlanProjection } from "./projection/execution-plan-builder";
export { buildExecutionProjection } from "./projection/execution-builder";
export { buildDefectProjection } from "./projection/defect-builder";
export { buildRequirementProjection } from "./projection/requirement-builder";
export { buildDocumentProjection } from "./projection/document-builder";

export {
  createProjectionEngine,
  type ProjectionEngine,
  type ProjectionApplyResult,
  type ProjectionDiagnostics,
} from "./projection/engine";

export {
  createKnowledgeSearchService,
  type KnowledgeSearchService,
  type KnowledgeSearchRequest,
  type KnowledgeSearchResponse,
  type KnowledgeSearchHit,
  type SearchSortField,
  type SearchSortDirection,
} from "./search/query-service";

export { createKnowledgeIndexEvidenceProcessors } from "./processors/evidence-processors";

export {
  createKnowledgeIndexProcessorBundle,
  KNOWLEDGE_INDEX_BUNDLE_ID,
  type KnowledgeIndexProcessorBundle,
} from "./processors/registry";

export { createQualityKnowledgeIndex, type QualityKnowledgeIndex } from "./compose";
