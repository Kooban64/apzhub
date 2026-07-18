/**
 * Factory for Support Search Publication Adapter (APZSEARCH-011).
 */

import {
  createSearchIntegration,
  type CreateSearchIntegrationOptions,
  type SearchIntegrationFramework,
  type SearchIntegrationPublisher,
} from "@apzhub/search-integration";

import { SupportSearchDiagnosticsStore } from "./diagnostics/support-search-observability";
import { SupportSearchErrorTranslator } from "./diagnostics/support-search-observability";
import { SupportSearchLogger } from "./diagnostics/support-search-observability";
import { SupportSearchMetrics } from "./diagnostics/support-search-observability";
import {
  createSupportSearchLifecycleHooks,
  type SupportSearchLifecycleHooks,
} from "./hooks/support-search-lifecycle-hooks";
import { SupportSearchLifecycle } from "./lifecycle/support-search-lifecycle";
import { SupportSearchEntityMapper } from "./mapper/support-search-entity-mapper";
import { SupportSearchPublisher } from "./publisher/support-search-publisher";
import { SupportSearchEntityValidator } from "./validator/support-search-entity-validator";

export type CreateSupportSearchAdapterOptions = {
  readonly integration?: SearchIntegrationFramework;
  readonly integrationPublisher?: SearchIntegrationPublisher;
  readonly searchIntegrationOptions?: CreateSearchIntegrationOptions;
};

export type SupportSearchAdapter = {
  readonly publisher: SupportSearchPublisher;
  readonly hooks: SupportSearchLifecycleHooks;
  readonly mapper: SupportSearchEntityMapper;
  readonly validator: SupportSearchEntityValidator;
  readonly lifecycle: SupportSearchLifecycle;
  readonly metrics: SupportSearchMetrics;
  readonly logger: SupportSearchLogger;
  readonly diagnostics: SupportSearchDiagnosticsStore;
  readonly errors: SupportSearchErrorTranslator;
  readonly integration: SearchIntegrationFramework;
};

export function createSupportSearchAdapter(
  options: CreateSupportSearchAdapterOptions = {},
): SupportSearchAdapter {
  const integration =
    options.integration ?? createSearchIntegration(options.searchIntegrationOptions);
  const integrationPublisher = options.integrationPublisher ?? integration.publisher;

  const mapper = new SupportSearchEntityMapper();
  const validator = new SupportSearchEntityValidator();
  const lifecycle = new SupportSearchLifecycle();
  const metrics = new SupportSearchMetrics();
  const logger = new SupportSearchLogger();
  const diagnostics = new SupportSearchDiagnosticsStore();
  const errors = new SupportSearchErrorTranslator();

  const publisher = new SupportSearchPublisher({
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
    hooks: createSupportSearchLifecycleHooks(publisher),
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
