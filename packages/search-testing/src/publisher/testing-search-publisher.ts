/**
 * TestingSearchPublisher — orchestrator only (APZSEARCH-013).
 *
 * Routes by entityType to specialised domain publishers.
 * Contains no domain-specific mapping logic.
 */

import type {
  SearchIntegrationPublisher,
  SearchPublicationResult,
  SearchEntityLifecycleState,
} from "@apzhub/search-integration";

import {
  toSearchIntegrationContext,
  type TestingSearchPublicationContext,
} from "../context/testing-search-publication-context";
import {
  TestingSearchDiagnostics,
  TestingSearchErrorTranslator,
  TestingSearchLogger,
  TestingSearchMetrics,
  type TestingSearchDiagnosticsSnapshot,
  type TestingSearchStatistics,
} from "../diagnostics/testing-search-observability";
import { TestingSearchLifecycle } from "../lifecycle/testing-search-lifecycle";
import {
  TestingSearchEntityMapper,
  type TestingSearchMappableEntity,
} from "../mapper/testing-search-entity-mapper";
import { TESTING_SEARCH_ENTITY_TYPES } from "../types/entity-types";
import { TestingSearchEntityValidator } from "../validator/testing-search-entity-validator";
import { AutomationPublisher } from "./automation-publisher";
import { CertificationPublisher } from "./certification-publisher";
import { failedPublicationResult } from "./domain-search-publisher-base";
import { EngineeringIntelligencePublisher } from "./engineering-intelligence-publisher";
import { ManualTestingPublisher } from "./manual-testing-publisher";
import { PipelinePublisher } from "./pipeline-publisher";
import type { TestingDomainSearchPublisher } from "./publication-contract";
import { QualityPublisher } from "./quality-publisher";
import { ReleasePublisher } from "./release-publisher";
import { ReportingMetadataPublisher } from "./reporting-metadata-publisher";

export type TestingSearchSpecialisedPublishers = {
  readonly manual: ManualTestingPublisher;
  readonly automation: AutomationPublisher;
  readonly certification: CertificationPublisher;
  readonly release: ReleasePublisher;
  readonly engineeringIntelligence: EngineeringIntelligencePublisher;
  readonly quality: QualityPublisher;
  readonly reportingMetadata: ReportingMetadataPublisher;
  readonly pipeline: PipelinePublisher;
};

export type TestingSearchPublisherOptions = {
  readonly integrationPublisher: SearchIntegrationPublisher;
  /** When omitted, specialised publishers are wired from shared deps + mapper. */
  readonly specialisedPublishers?: TestingSearchSpecialisedPublishers;
  readonly mapper?: TestingSearchEntityMapper;
  readonly validator?: TestingSearchEntityValidator;
  readonly lifecycle?: TestingSearchLifecycle;
  readonly metrics?: TestingSearchMetrics;
  readonly logger?: TestingSearchLogger;
  readonly diagnostics?: TestingSearchDiagnostics;
  readonly errors?: TestingSearchErrorTranslator;
};

function buildDefaultSpecialisedPublishers(
  integrationPublisher: SearchIntegrationPublisher,
  mapper: TestingSearchEntityMapper,
  validator: TestingSearchEntityValidator,
  metrics: TestingSearchMetrics,
  logger: TestingSearchLogger,
  diagnostics: TestingSearchDiagnostics,
  errors: TestingSearchErrorTranslator,
): TestingSearchSpecialisedPublishers {
  const deps = {
    integrationPublisher,
    validator,
    metrics,
    logger,
    diagnostics,
    errors,
  };
  return {
    manual: new ManualTestingPublisher(deps, mapper.getManualMapper()),
    automation: new AutomationPublisher(deps, mapper.getAutomationMapper()),
    certification: new CertificationPublisher(
      deps,
      mapper.getCertificationMapper(),
    ),
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

export class TestingSearchPublisher {
  private readonly specialised: TestingSearchSpecialisedPublishers;
  private readonly byEntityType: ReadonlyMap<
    string,
    TestingDomainSearchPublisher
  >;
  private readonly mapper: TestingSearchEntityMapper;
  private readonly validator: TestingSearchEntityValidator;
  private readonly lifecycleHelper: TestingSearchLifecycle;
  private readonly metrics: TestingSearchMetrics;
  private readonly logger: TestingSearchLogger;
  private readonly diagnosticsStore: TestingSearchDiagnostics;
  private readonly errors: TestingSearchErrorTranslator;
  private readonly integrationPublisher: SearchIntegrationPublisher;

  constructor(private readonly options: TestingSearchPublisherOptions) {
    this.integrationPublisher = options.integrationPublisher;
    this.mapper = options.mapper ?? new TestingSearchEntityMapper();
    this.validator = options.validator ?? new TestingSearchEntityValidator();
    this.lifecycleHelper =
      options.lifecycle ?? new TestingSearchLifecycle();
    this.metrics = options.metrics ?? new TestingSearchMetrics();
    this.logger = options.logger ?? new TestingSearchLogger();
    this.diagnosticsStore =
      options.diagnostics ?? new TestingSearchDiagnostics();
    this.errors = options.errors ?? new TestingSearchErrorTranslator();
    this.specialised =
      options.specialisedPublishers ??
      buildDefaultSpecialisedPublishers(
        this.integrationPublisher,
        this.mapper,
        this.validator,
        this.metrics,
        this.logger,
        this.diagnosticsStore,
        this.errors,
      );

    const map = new Map<string, TestingDomainSearchPublisher>();
    for (const pub of Object.values(this.specialised)) {
      for (const entityType of pub.entityTypes) {
        map.set(entityType, pub);
      }
    }
    this.byEntityType = map;
  }

  getSpecialisedPublishers(): TestingSearchSpecialisedPublishers {
    return this.specialised;
  }

  resolvePublisher(
    entityType: TestingSearchMappableEntity["entityType"],
  ): TestingDomainSearchPublisher {
    const pub = this.byEntityType.get(entityType);
    if (!pub) {
      throw new Error(
        `No specialised Testing search publisher for entity type: ${entityType}`,
      );
    }
    return pub;
  }

  validate(
    context: TestingSearchPublicationContext,
    input: TestingSearchMappableEntity,
  ): SearchPublicationResult {
    try {
      return this.resolvePublisher(input.entityType).validate(context, input);
    } catch (error) {
      const domain = this.errors.translate(error);
      return failedPublicationResult(
        "validate",
        context,
        domain.message,
        Date.now(),
      );
    }
  }

  preview(
    context: TestingSearchPublicationContext,
    input: TestingSearchMappableEntity,
  ): SearchPublicationResult {
    try {
      return this.resolvePublisher(input.entityType).preview(context, input);
    } catch (error) {
      const domain = this.errors.translate(error);
      return failedPublicationResult(
        "preview",
        context,
        domain.message,
        Date.now(),
      );
    }
  }

  publish(
    context: TestingSearchPublicationContext,
    input: TestingSearchMappableEntity,
  ): SearchPublicationResult {
    try {
      return this.resolvePublisher(input.entityType).publish(context, input);
    } catch (error) {
      const domain = this.errors.translate(error);
      return failedPublicationResult(
        "publish",
        context,
        domain.message,
        Date.now(),
      );
    }
  }

  update(
    context: TestingSearchPublicationContext,
    input: TestingSearchMappableEntity,
  ): SearchPublicationResult {
    try {
      return this.resolvePublisher(input.entityType).update(context, input);
    } catch (error) {
      const domain = this.errors.translate(error);
      return failedPublicationResult(
        "update",
        context,
        domain.message,
        Date.now(),
      );
    }
  }

  remove(
    context: TestingSearchPublicationContext,
    entityType: TestingSearchMappableEntity["entityType"],
    entityId: string,
  ): SearchPublicationResult {
    try {
      return this.resolvePublisher(entityType).remove(
        context,
        entityType,
        entityId,
      );
    } catch (error) {
      const domain = this.errors.translate(error);
      return failedPublicationResult(
        "remove",
        context,
        domain.message,
        Date.now(),
      );
    }
  }

  lifecycle(
    context: TestingSearchPublicationContext,
    entityId: string,
    state: SearchEntityLifecycleState,
    reason?: string,
  ): SearchPublicationResult {
    const started = Date.now();
    this.diagnosticsStore.touch("lifecycle", context.correlationId);
    try {
      void this.lifecycleHelper.canTransition("published", state);
      return this.integrationPublisher.lifecycle(
        toSearchIntegrationContext(context),
        entityId,
        state,
        reason ?? context.publicationReason,
      );
    } catch (error) {
      const domain = this.errors.translate(error);
      return failedPublicationResult("lifecycle", context, domain.message, started);
    }
  }

  diagnostics(
    context: TestingSearchPublicationContext,
  ): TestingSearchDiagnosticsSnapshot {
    this.diagnosticsStore.touch("diagnostics", context.correlationId);
    return this.diagnosticsStore.build(
      this.metrics.snapshot(),
      TESTING_SEARCH_ENTITY_TYPES,
    );
  }

  statistics(
    _context: TestingSearchPublicationContext,
  ): TestingSearchStatistics {
    return this.metrics.snapshot();
  }

  getMapper(): TestingSearchEntityMapper {
    return this.mapper;
  }

  getValidator(): TestingSearchEntityValidator {
    return this.validator;
  }

  getLifecycle(): TestingSearchLifecycle {
    return this.lifecycleHelper;
  }

  getLogger(): TestingSearchLogger {
    return this.logger;
  }

  getMetrics(): TestingSearchMetrics {
    return this.metrics;
  }

  getIntegrationPublisher(): SearchIntegrationPublisher {
    return this.integrationPublisher;
  }
}
