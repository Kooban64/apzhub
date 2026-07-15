/**
 * Factory for Documents Search Publication Adapter (APZSEARCH-012).
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

import { DocumentsSearchDiagnosticsStore } from "./diagnostics/documents-search-observability";
import { DocumentsSearchErrorTranslator } from "./diagnostics/documents-search-observability";
import { DocumentsSearchLogger } from "./diagnostics/documents-search-observability";
import { DocumentsSearchMetrics } from "./diagnostics/documents-search-observability";
import {
  createDocumentsSearchLifecycleHooks,
  type DocumentsSearchLifecycleHooks,
} from "./hooks/documents-search-lifecycle-hooks";
import { DocumentsSearchLifecycle } from "./lifecycle/documents-search-lifecycle";
import { DocumentsSearchEntityMapper } from "./mapper/documents-search-entity-mapper";
import { DocumentsSearchPublisher } from "./publisher/documents-search-publisher";
import { DocumentsSearchEntityValidator } from "./validator/documents-search-entity-validator";

export type CreateDocumentsSearchAdapterOptions = {
  readonly integration?: SearchIntegrationFramework;
  readonly integrationPublisher?: SearchIntegrationPublisher;
  /** Explicit sink — required for production when integrationPublisher omitted. */
  readonly sink?: SearchPublicationSink;
  readonly searchIntegrationOptions?: CreateSearchIntegrationOptions;
};

export type DocumentsSearchAdapter = {
  readonly publisher: DocumentsSearchPublisher;
  readonly hooks: DocumentsSearchLifecycleHooks;
  readonly mapper: DocumentsSearchEntityMapper;
  readonly validator: DocumentsSearchEntityValidator;
  readonly lifecycle: DocumentsSearchLifecycle;
  readonly metrics: DocumentsSearchMetrics;
  readonly logger: DocumentsSearchLogger;
  readonly diagnostics: DocumentsSearchDiagnosticsStore;
  readonly errors: DocumentsSearchErrorTranslator;
  readonly integration: SearchIntegrationFramework;
};

function resolveProductionIntegration(
  options: CreateDocumentsSearchAdapterOptions,
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
    "createDocumentsSearchAdapter requires integrationPublisher or an explicit sink (no silent in-memory fallback)",
  );
}

function buildAdapter(
  integration: SearchIntegrationFramework,
  integrationPublisher: SearchIntegrationPublisher,
): DocumentsSearchAdapter {
  const mapper = new DocumentsSearchEntityMapper();
  const validator = new DocumentsSearchEntityValidator();
  const lifecycle = new DocumentsSearchLifecycle();
  const metrics = new DocumentsSearchMetrics();
  const logger = new DocumentsSearchLogger();
  const diagnostics = new DocumentsSearchDiagnosticsStore();
  const errors = new DocumentsSearchErrorTranslator();

  const publisher = new DocumentsSearchPublisher({
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
    hooks: createDocumentsSearchLifecycleHooks(publisher),
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
export function createDocumentsSearchAdapter(
  options: CreateDocumentsSearchAdapterOptions = {},
): DocumentsSearchAdapter {
  const resolved = resolveProductionIntegration(options);
  return buildAdapter(resolved.integration, resolved.integrationPublisher);
}

/** Production publisher — requires explicit publisher or sink. */
export function createDocumentsSearchPublisher(
  options: CreateDocumentsSearchAdapterOptions = {},
): DocumentsSearchPublisher {
  return createDocumentsSearchAdapter(options).publisher;
}

/** Test adapter — may use in-memory sink via createSearchIntegration(). */
export function createDocumentsSearchAdapterForTest(
  options: CreateDocumentsSearchAdapterOptions = {},
): DocumentsSearchAdapter {
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
export function createDocumentsSearchPublisherForTest(
  options: CreateDocumentsSearchAdapterOptions = {},
): DocumentsSearchPublisher {
  return createDocumentsSearchAdapterForTest(options).publisher;
}
