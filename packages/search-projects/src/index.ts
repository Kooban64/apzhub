/** @apzhub/search-projects — APZSEARCH-010 Projects Search Publication Adapter */

export { SEARCH_PROJECTS_VERSION } from "./version";

export {
  PROJECTS_SEARCH_ENTITY_TYPES,
  assertPlatformEntityId,
  isProjectsSearchEntityType,
  looksLikePlaneIdentifier,
  type ProjectsSearchEntityType,
} from "./types/entity-types";

export {
  createProjectsSearchPublicationContext,
  toSearchIntegrationContext,
  type ProjectsSearchPublicationContext,
} from "./context/projects-search-publication-context";

export {
  ProjectsSearchEntityMapper,
  type ProjectsSearchMappableEntity,
} from "./mapper/projects-search-entity-mapper";

export {
  ProjectsSearchEntityValidator,
  type ProjectsSearchValidationIssue,
  type ProjectsSearchValidationResult,
} from "./validator/projects-search-entity-validator";

export { ProjectsSearchLifecycle } from "./lifecycle/projects-search-lifecycle";

export {
  ProjectsSearchDiagnosticsStore,
  ProjectsSearchErrorTranslator,
  ProjectsSearchLogger,
  ProjectsSearchMetrics,
  type ProjectsSearchDiagnostics,
  type ProjectsSearchLogEntry,
  type ProjectsSearchLogLevel,
  type ProjectsSearchStatistics,
} from "./diagnostics/projects-search-observability";

export {
  ProjectsSearchPublisher,
  type ProjectsSearchPublisherOptions,
} from "./publisher/projects-search-publisher";

export {
  createProjectsSearchLifecycleHooks,
  type ProjectsSearchLifecycleHooks,
} from "./hooks/projects-search-lifecycle-hooks";

export {
  createProjectsSearchAdapter,
  type CreateProjectsSearchAdapterOptions,
  type ProjectsSearchAdapter,
} from "./factory";
