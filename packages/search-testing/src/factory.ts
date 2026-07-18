/**
 * Factory for Testing Search Publication Adapter (APZSEARCH-013).
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

import { TestingSearchDiagnostics } from "./diagnostics/testing-search-observability";
import { TestingSearchErrorTranslator } from "./diagnostics/testing-search-observability";
import { TestingSearchLogger } from "./diagnostics/testing-search-observability";
import { TestingSearchMetrics } from "./diagnostics/testing-search-observability";
import {
  createTestingSearchLifecycleHooks,
  type TestingSearchLifecycleHooks,
} from "./hooks/testing-search-lifecycle-hooks";
import { TestingSearchLifecycle } from "./lifecycle/testing-search-lifecycle";
import { TestingSearchEntityMapper } from "./mapper/testing-search-entity-mapper";
import { AutomationPublisher } from "./publisher/automation-publisher";
import { CertificationPublisher } from "./publisher/certification-publisher";
import type { DomainSearchPublisherDeps } from "./publisher/domain-search-publisher-base";
import { EngineeringIntelligencePublisher } from "./publisher/engineering-intelligence-publisher";
import { ManualTestingPublisher } from "./publisher/manual-testing-publisher";
import { PipelinePublisher } from "./publisher/pipeline-publisher";
import { QualityPublisher } from "./publisher/quality-publisher";
import { ReleasePublisher } from "./publisher/release-publisher";
import { ReportingMetadataPublisher } from "./publisher/reporting-metadata-publisher";
import {
  TestingSearchPublisher,
  type TestingSearchSpecialisedPublishers,
} from "./publisher/testing-search-publisher";
import { TestingSearchEntityValidator } from "./validator/testing-search-entity-validator";

export type CreateTestingSearchAdapterOptions = {
  readonly integration?: SearchIntegrationFramework;
  readonly integrationPublisher?: SearchIntegrationPublisher;
  /** Explicit sink — required for production when integrationPublisher omitted. */
  readonly sink?: SearchPublicationSink;
  readonly searchIntegrationOptions?: CreateSearchIntegrationOptions;
};

export type TestingSearchAdapter = {
  readonly publisher: TestingSearchPublisher;
  readonly hooks: TestingSearchLifecycleHooks;
  readonly mapper: TestingSearchEntityMapper;
  readonly validator: TestingSearchEntityValidator;
  readonly lifecycle: TestingSearchLifecycle;
  readonly metrics: TestingSearchMetrics;
  readonly logger: TestingSearchLogger;
  readonly diagnostics: TestingSearchDiagnostics;
  readonly errors: TestingSearchErrorTranslator;
  readonly integration: SearchIntegrationFramework;
  readonly specialisedPublishers: TestingSearchSpecialisedPublishers;
};

function resolveProductionIntegration(options: CreateTestingSearchAdapterOptions): {
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
      options.integration ?? createSearchIntegration(options.searchIntegrationOptions);
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
    "createTestingSearchAdapter requires integrationPublisher or an explicit sink (no silent in-memory fallback)",
  );
}

function buildSpecialisedPublishers(
  deps: DomainSearchPublisherDeps,
  mapper: TestingSearchEntityMapper,
): TestingSearchSpecialisedPublishers {
  return {
    manual: new ManualTestingPublisher(deps, mapper.getManualMapper()),
    automation: new AutomationPublisher(deps, mapper.getAutomationMapper()),
    certification: new CertificationPublisher(deps, mapper.getCertificationMapper()),
    release: new ReleasePublisher(deps, mapper.getReleaseMapper()),
    engineeringIntelligence: new EngineeringIntelligencePublisher(
      deps,
      mapper.getEngineeringMapper(),
    ),
    quality: new QualityPublisher(deps, mapper.getQualityMapper()),
    reportingMetadata: new ReportingMetadataPublisher(
      deps,
      mapper.getReportingMapper(),
    ),
    pipeline: new PipelinePublisher(deps, mapper.getPipelineMapper()),
  };
}

function buildAdapter(
  integration: SearchIntegrationFramework,
  integrationPublisher: SearchIntegrationPublisher,
): TestingSearchAdapter {
  const mapper = new TestingSearchEntityMapper();
  const validator = new TestingSearchEntityValidator();
  const lifecycle = new TestingSearchLifecycle();
  const metrics = new TestingSearchMetrics();
  const logger = new TestingSearchLogger();
  const diagnostics = new TestingSearchDiagnostics();
  const errors = new TestingSearchErrorTranslator();

  const deps: DomainSearchPublisherDeps = {
    integrationPublisher,
    validator,
    metrics,
    logger,
    diagnostics,
    errors,
  };

  const specialisedPublishers = buildSpecialisedPublishers(deps, mapper);

  const publisher = new TestingSearchPublisher({
    integrationPublisher,
    specialisedPublishers,
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
    hooks: createTestingSearchLifecycleHooks(publisher),
    mapper,
    validator,
    lifecycle,
    metrics,
    logger,
    diagnostics,
    errors,
    integration,
    specialisedPublishers,
  };
}

/** Production adapter — requires explicit publisher or sink. */
export function createTestingSearchAdapter(
  options: CreateTestingSearchAdapterOptions = {},
): TestingSearchAdapter {
  const resolved = resolveProductionIntegration(options);
  return buildAdapter(resolved.integration, resolved.integrationPublisher);
}

/** Production publisher — requires explicit publisher or sink. */
export function createTestingSearchPublisher(
  options: CreateTestingSearchAdapterOptions = {},
): TestingSearchPublisher {
  return createTestingSearchAdapter(options).publisher;
}

/** Test adapter — may use in-memory sink via createSearchIntegration(). */
export function createTestingSearchAdapterForTest(
  options: CreateTestingSearchAdapterOptions = {},
): TestingSearchAdapter {
  const integration =
    options.integration ??
    createSearchIntegration(
      options.sink
        ? { sink: options.sink, ...options.searchIntegrationOptions }
        : options.searchIntegrationOptions,
    );
  const integrationPublisher = options.integrationPublisher ?? integration.publisher;
  return buildAdapter(integration, integrationPublisher);
}

/** Test publisher — may use in-memory sink. */
export function createTestingSearchPublisherForTest(
  options: CreateTestingSearchAdapterOptions = {},
): TestingSearchPublisher {
  return createTestingSearchAdapterForTest(options).publisher;
}
