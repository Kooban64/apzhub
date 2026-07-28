/**
 * Factory for Law Search Publication Adapter (R12-SEARCH-02).
 */

import {
  createSearchIntegration,
  type CreateSearchIntegrationOptions,
  type SearchIntegrationFramework,
  type SearchIntegrationPublisher,
} from "@apzhub/search-integration";

import { LawSearchDiagnosticsStore } from "./diagnostics/law-search-observability";
import { LawSearchErrorTranslator } from "./diagnostics/law-search-observability";
import { LawSearchLogger } from "./diagnostics/law-search-observability";
import { LawSearchMetrics } from "./diagnostics/law-search-observability";
import {
  createLawSearchLifecycleHooks,
  type LawSearchLifecycleHooks,
} from "./hooks/law-search-lifecycle-hooks";
import { LawSearchLifecycle } from "./lifecycle/law-search-lifecycle";
import { LawSearchEntityMapper } from "./mapper/law-search-entity-mapper";
import { LawSearchPublisher } from "./publisher/law-search-publisher";
import { LawSearchEntityValidator } from "./validator/law-search-entity-validator";

export type CreateLawSearchAdapterOptions = {
  readonly integration?: SearchIntegrationFramework;
  readonly integrationPublisher?: SearchIntegrationPublisher;
  readonly searchIntegrationOptions?: CreateSearchIntegrationOptions;
};

export type LawSearchAdapter = {
  readonly publisher: LawSearchPublisher;
  readonly hooks: LawSearchLifecycleHooks;
  readonly mapper: LawSearchEntityMapper;
  readonly validator: LawSearchEntityValidator;
  readonly lifecycle: LawSearchLifecycle;
  readonly metrics: LawSearchMetrics;
  readonly logger: LawSearchLogger;
  readonly diagnostics: LawSearchDiagnosticsStore;
  readonly errors: LawSearchErrorTranslator;
  readonly integration: SearchIntegrationFramework;
};

export function createLawSearchAdapter(
  options: CreateLawSearchAdapterOptions = {},
): LawSearchAdapter {
  const integration =
    options.integration ?? createSearchIntegration(options.searchIntegrationOptions);
  const integrationPublisher = options.integrationPublisher ?? integration.publisher;

  const mapper = new LawSearchEntityMapper();
  const validator = new LawSearchEntityValidator();
  const lifecycle = new LawSearchLifecycle();
  const metrics = new LawSearchMetrics();
  const logger = new LawSearchLogger();
  const diagnostics = new LawSearchDiagnosticsStore();
  const errors = new LawSearchErrorTranslator();

  const publisher = new LawSearchPublisher({
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
    hooks: createLawSearchLifecycleHooks(publisher),
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
