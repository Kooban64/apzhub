/**
 * Factory for Reporting Search Publication Adapter (APZSEARCH-014).
 *
 * Production factories require an explicit `integrationPublisher` or `sink`.
 * Test factories may use the in-memory sink via createSearchIntegration().
 */

import {
  createSearchIntegration,
  type CreateSearchIntegrationOptions,
  type SearchIntegrationFramework,
  type SearchIntegrationPublisher,
  type SearchPublicationSink,
} from "@apzhub/search-integration";

import { ReportingSearchDiagnosticsStore } from "./diagnostics/reporting-search-observability";
import { ReportingSearchErrorTranslator } from "./diagnostics/reporting-search-observability";
import { ReportingSearchLogger } from "./diagnostics/reporting-search-observability";
import { ReportingSearchMetrics } from "./diagnostics/reporting-search-observability";
import {
  createReportingSearchLifecycleHooks,
  type ReportingSearchLifecycleHooks,
} from "./hooks/reporting-search-lifecycle-hooks";
import { ReportingSearchLifecycle } from "./lifecycle/reporting-search-lifecycle";
import { ReportingSearchEntityMapper } from "./mapper/reporting-search-entity-mapper";
import { ReportingSearchPublisher } from "./publisher/reporting-search-publisher";
import { ReportingSearchEntityValidator } from "./validator/reporting-search-entity-validator";

export type CreateReportingSearchAdapterOptions = {
  readonly integration?: SearchIntegrationFramework;
  readonly integrationPublisher?: SearchIntegrationPublisher;
  /** Explicit sink — required for production when integrationPublisher omitted. */
  readonly sink?: SearchPublicationSink;
  readonly searchIntegrationOptions?: CreateSearchIntegrationOptions;
};

export type ReportingSearchAdapter = {
  readonly publisher: ReportingSearchPublisher;
  readonly hooks: ReportingSearchLifecycleHooks;
  readonly mapper: ReportingSearchEntityMapper;
  readonly validator: ReportingSearchEntityValidator;
  readonly lifecycle: ReportingSearchLifecycle;
  readonly metrics: ReportingSearchMetrics;
  readonly logger: ReportingSearchLogger;
  readonly diagnostics: ReportingSearchDiagnosticsStore;
  readonly errors: ReportingSearchErrorTranslator;
  readonly integration: SearchIntegrationFramework;
};

function resolveProductionIntegration(
  options: CreateReportingSearchAdapterOptions,
): {
  integration: SearchIntegrationFramework;
  integrationPublisher: SearchIntegrationPublisher;
} {
  if (options.integrationPublisher) {
    const integration =
      options.integration ??
      (options.sink
        ? createSearchIntegration({ sink: options.sink })
        : options.searchIntegrationOptions?.sink ||
            options.searchIntegrationOptions?.sinkKind
          ? createSearchIntegration(options.searchIntegrationOptions)
          : createSearchIntegration({
              sink: options.integrationPublisher.getSink(),
            }));
    return {
      integration,
      integrationPublisher: options.integrationPublisher,
    };
  }

  if (options.sink) {
    const integration =
      options.integration ?? createSearchIntegration({ sink: options.sink });
    return { integration, integrationPublisher: integration.publisher };
  }

  if (
    options.searchIntegrationOptions?.sink ||
    options.searchIntegrationOptions?.sinkKind
  ) {
    const integration =
      options.integration ??
      createSearchIntegration(options.searchIntegrationOptions);
    return { integration, integrationPublisher: integration.publisher };
  }

  if (options.integration) {
    // Pre-built integration counts as explicit wiring (caller owns the sink).
    return {
      integration: options.integration,
      integrationPublisher: options.integration.publisher,
    };
  }

  throw new Error(
    "createReportingSearchAdapter requires integrationPublisher or an explicit sink (no silent in-memory fallback)",
  );
}

function buildAdapter(
  integration: SearchIntegrationFramework,
  integrationPublisher: SearchIntegrationPublisher,
): ReportingSearchAdapter {
  const mapper = new ReportingSearchEntityMapper();
  const validator = new ReportingSearchEntityValidator();
  const lifecycle = new ReportingSearchLifecycle();
  const metrics = new ReportingSearchMetrics();
  const logger = new ReportingSearchLogger();
  const diagnostics = new ReportingSearchDiagnosticsStore();
  const errors = new ReportingSearchErrorTranslator();

  const publisher = new ReportingSearchPublisher({
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
    hooks: createReportingSearchLifecycleHooks(publisher),
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

/** Production adapter — requires explicit publisher or sink. */
export function createReportingSearchAdapter(
  options: CreateReportingSearchAdapterOptions = {},
): ReportingSearchAdapter {
  const resolved = resolveProductionIntegration(options);
  return buildAdapter(resolved.integration, resolved.integrationPublisher);
}

/** Production publisher — requires explicit publisher or sink. */
export function createReportingSearchPublisher(
  options: CreateReportingSearchAdapterOptions = {},
): ReportingSearchPublisher {
  return createReportingSearchAdapter(options).publisher;
}

/** Test adapter — may use in-memory sink via createSearchIntegration(). */
export function createReportingSearchAdapterForTest(
  options: CreateReportingSearchAdapterOptions = {},
): ReportingSearchAdapter {
  const integration =
    options.integration ??
    createSearchIntegration(
      options.sink
        ? { sink: options.sink, ...options.searchIntegrationOptions }
        : options.searchIntegrationOptions,
    );
  const integrationPublisher =
    options.integrationPublisher ?? integration.publisher;
  return buildAdapter(integration, integrationPublisher);
}

/** Test publisher — may use in-memory sink. */
export function createReportingSearchPublisherForTest(
  options: CreateReportingSearchAdapterOptions = {},
): ReportingSearchPublisher {
  return createReportingSearchAdapterForTest(options).publisher;
}
