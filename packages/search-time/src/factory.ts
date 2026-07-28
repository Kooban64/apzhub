/**
 * Factory for Time Search Publication Adapter (R12-SEARCH-01).
 */

import {
  createSearchIntegration,
  type CreateSearchIntegrationOptions,
  type SearchIntegrationFramework,
  type SearchIntegrationPublisher,
} from "@apzhub/search-integration";

import { TimeSearchDiagnosticsStore } from "./diagnostics/time-search-observability";
import { TimeSearchErrorTranslator } from "./diagnostics/time-search-observability";
import { TimeSearchLogger } from "./diagnostics/time-search-observability";
import { TimeSearchMetrics } from "./diagnostics/time-search-observability";
import {
  createTimeSearchLifecycleHooks,
  type TimeSearchLifecycleHooks,
} from "./hooks/time-search-lifecycle-hooks";
import { TimeSearchLifecycle } from "./lifecycle/time-search-lifecycle";
import { TimeSearchEntityMapper } from "./mapper/time-search-entity-mapper";
import { TimeSearchPublisher } from "./publisher/time-search-publisher";
import { TimeSearchEntityValidator } from "./validator/time-search-entity-validator";

export type CreateTimeSearchAdapterOptions = {
  readonly integration?: SearchIntegrationFramework;
  readonly integrationPublisher?: SearchIntegrationPublisher;
  readonly searchIntegrationOptions?: CreateSearchIntegrationOptions;
};

export type TimeSearchAdapter = {
  readonly publisher: TimeSearchPublisher;
  readonly hooks: TimeSearchLifecycleHooks;
  readonly mapper: TimeSearchEntityMapper;
  readonly validator: TimeSearchEntityValidator;
  readonly lifecycle: TimeSearchLifecycle;
  readonly metrics: TimeSearchMetrics;
  readonly logger: TimeSearchLogger;
  readonly diagnostics: TimeSearchDiagnosticsStore;
  readonly errors: TimeSearchErrorTranslator;
  readonly integration: SearchIntegrationFramework;
};

export function createTimeSearchAdapter(
  options: CreateTimeSearchAdapterOptions = {},
): TimeSearchAdapter {
  const integration =
    options.integration ?? createSearchIntegration(options.searchIntegrationOptions);
  const integrationPublisher = options.integrationPublisher ?? integration.publisher;

  const mapper = new TimeSearchEntityMapper();
  const validator = new TimeSearchEntityValidator();
  const lifecycle = new TimeSearchLifecycle();
  const metrics = new TimeSearchMetrics();
  const logger = new TimeSearchLogger();
  const diagnostics = new TimeSearchDiagnosticsStore();
  const errors = new TimeSearchErrorTranslator();

  const publisher = new TimeSearchPublisher({
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
    hooks: createTimeSearchLifecycleHooks(publisher),
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
