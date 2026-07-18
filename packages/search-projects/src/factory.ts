/**
 * Factory for Projects Search Publication Adapter (APZSEARCH-010).
 */

import {
  createSearchIntegration,
  type CreateSearchIntegrationOptions,
  type SearchIntegrationFramework,
  type SearchIntegrationPublisher,
} from "@apzhub/search-integration";

import { ProjectsSearchDiagnosticsStore } from "./diagnostics/projects-search-observability";
import { ProjectsSearchErrorTranslator } from "./diagnostics/projects-search-observability";
import { ProjectsSearchLogger } from "./diagnostics/projects-search-observability";
import { ProjectsSearchMetrics } from "./diagnostics/projects-search-observability";
import {
  createProjectsSearchLifecycleHooks,
  type ProjectsSearchLifecycleHooks,
} from "./hooks/projects-search-lifecycle-hooks";
import { ProjectsSearchLifecycle } from "./lifecycle/projects-search-lifecycle";
import { ProjectsSearchEntityMapper } from "./mapper/projects-search-entity-mapper";
import { ProjectsSearchPublisher } from "./publisher/projects-search-publisher";
import { ProjectsSearchEntityValidator } from "./validator/projects-search-entity-validator";

export type CreateProjectsSearchAdapterOptions = {
  readonly integration?: SearchIntegrationFramework;
  readonly integrationPublisher?: SearchIntegrationPublisher;
  readonly searchIntegrationOptions?: CreateSearchIntegrationOptions;
};

export type ProjectsSearchAdapter = {
  readonly publisher: ProjectsSearchPublisher;
  readonly hooks: ProjectsSearchLifecycleHooks;
  readonly mapper: ProjectsSearchEntityMapper;
  readonly validator: ProjectsSearchEntityValidator;
  readonly lifecycle: ProjectsSearchLifecycle;
  readonly metrics: ProjectsSearchMetrics;
  readonly logger: ProjectsSearchLogger;
  readonly diagnostics: ProjectsSearchDiagnosticsStore;
  readonly errors: ProjectsSearchErrorTranslator;
  readonly integration: SearchIntegrationFramework;
};

export function createProjectsSearchAdapter(
  options: CreateProjectsSearchAdapterOptions = {},
): ProjectsSearchAdapter {
  const integration =
    options.integration ?? createSearchIntegration(options.searchIntegrationOptions);
  const integrationPublisher = options.integrationPublisher ?? integration.publisher;

  const mapper = new ProjectsSearchEntityMapper();
  const validator = new ProjectsSearchEntityValidator();
  const lifecycle = new ProjectsSearchLifecycle();
  const metrics = new ProjectsSearchMetrics();
  const logger = new ProjectsSearchLogger();
  const diagnostics = new ProjectsSearchDiagnosticsStore();
  const errors = new ProjectsSearchErrorTranslator();

  const publisher = new ProjectsSearchPublisher({
    integrationPublisher,
    mapper,
    validator,
    lifecycle,
    metrics,
    logger,
    diagnostics,
    errors,
  });

  return {
    publisher,
    hooks: createProjectsSearchLifecycleHooks(publisher),
    mapper,
    validator,
    lifecycle,
    metrics,
    logger,
    diagnostics,
    errors,
    integration,
  };
}
