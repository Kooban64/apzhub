/**
 * Observability Platform Services factories (APZOBSERVE-002 + ADR-0070 Phase A).
 * Production: PostgreSQL — no silent in-memory / allow-all authz fallbacks.
 */

import type { DatabaseExecutor } from "@apzhub/config";
import type { ObservePlatformGateway } from "@apzhub/observe-contracts";
import {
  createObserveAlertEvaluationDomain,
  createObserveFoundation,
  createPlatformObserveService,
  readAlertLifecycleMetadata,
  type ObserveAlertEvaluationMetrics,
  type ObserveFoundationRepos,
} from "@apzhub/observe-core";
import {
  createObservePersistenceForTest,
  createProductionObservePersistence,
  type ObservePersistenceBundle,
} from "@apzhub/observe-persistence";

import type { DomainEventPublisher } from "../../events/domain-event-publisher";
import {
  OBSERVE_ALERT_DOMAIN_EVENT_IDS,
  publishObserveAlertEvent,
  type ObserveAlertDomainEventId,
} from "../../events/observe-domain-events";
import type { RequestPipeline } from "../../execution/request-pipeline";
import { wrapServiceWithPipeline } from "../../execution/wrap-service";
import {
  createNoopObserveAlertDeliveryHook,
  type ObserveAlertDeliveryHook,
} from "./alert-delivery-hook";
import { isObserveAlertEvaluationEnabled } from "./observe-env";
import {
  createObservePlatformServiceImpls,
  type ObservePlatformServiceImpls,
} from "./observe-service-impls";

export type ObservePlatformServicesBundle = {
  readonly foundation: ObserveFoundationRepos;
  readonly persistence: ObservePersistenceBundle;
  readonly gatewaySurface: ObservePlatformGateway;
  readonly impls: ObservePlatformServiceImpls;
  readonly readiness: {
    readonly observeEnabled: true;
    readonly persistenceMode: "postgres" | "memory";
    readonly providerExecutionEnabled: false;
    readonly alertEvaluationEnabled: boolean;
  };
  wrapWithPipeline(pipeline: RequestPipeline): ObservePlatformGateway;
};

export type CreateObservePlatformServicesInput = {
  readonly foundation?: ObserveFoundationRepos;
  readonly persistence?: ObservePersistenceBundle;
  readonly now?: () => string;
  readonly id?: () => string;
  readonly eventPublisher?: DomainEventPublisher;
  readonly deliveryHook?: ObserveAlertDeliveryHook;
  readonly env?: Readonly<Record<string, string | undefined>>;
  readonly evaluationMetrics?: ObserveAlertEvaluationMetrics;
};

export type CreateObservePlatformServicesForProductionInput = {
  readonly postgresDb: DatabaseExecutor;
  readonly now?: () => string;
  readonly id?: () => string;
  readonly eventPublisher?: DomainEventPublisher;
  readonly deliveryHook?: ObserveAlertDeliveryHook;
  readonly env?: Readonly<Record<string, string | undefined>>;
};

export type CreateObservePlatformServicesForTestInput = {
  readonly postgresDb?: DatabaseExecutor;
  readonly allowInMemoryPersistence?: boolean;
  readonly now?: () => string;
  readonly id?: () => string;
  readonly eventPublisher?: DomainEventPublisher;
  readonly deliveryHook?: ObserveAlertDeliveryHook;
  readonly env?: Readonly<Record<string, string | undefined>>;
  readonly evaluationMetrics?: ObserveAlertEvaluationMetrics;
};

export function wrapObservePlatformGatewayWithPipeline(
  gateway: ObservePlatformGateway,
  pipeline: RequestPipeline,
): ObservePlatformGateway {
  return {
    healthChecks: wrapServiceWithPipeline(
      gateway.healthChecks,
      pipeline,
      "observeHealthChecks",
    ),
    readinessChecks: wrapServiceWithPipeline(
      gateway.readinessChecks,
      pipeline,
      "observeReadinessChecks",
    ),
    livenessChecks: wrapServiceWithPipeline(
      gateway.livenessChecks,
      pipeline,
      "observeLivenessChecks",
    ),
    serviceHealth: wrapServiceWithPipeline(
      gateway.serviceHealth,
      pipeline,
      "observeServiceHealth",
    ),
    serviceStatus: wrapServiceWithPipeline(
      gateway.serviceStatus,
      pipeline,
      "observeServiceStatus",
    ),
    componentStatus: wrapServiceWithPipeline(
      gateway.componentStatus,
      pipeline,
      "observeComponentStatus",
    ),
    metricDefinitions: wrapServiceWithPipeline(
      gateway.metricDefinitions,
      pipeline,
      "observeMetricDefinitions",
    ),
    metricSamples: wrapServiceWithPipeline(
      gateway.metricSamples,
      pipeline,
      "observeMetricSamples",
    ),
    alertDefinitions: wrapServiceWithPipeline(
      gateway.alertDefinitions,
      pipeline,
      "observeAlertDefinitions",
    ),
    alertStates: wrapServiceWithPipeline(
      gateway.alertStates,
      pipeline,
      "observeAlertStates",
    ),
    alertEvaluation: wrapServiceWithPipeline(
      gateway.alertEvaluation,
      pipeline,
      "observeAlertEvaluation",
    ),
    dashboardDefinitions: wrapServiceWithPipeline(
      gateway.dashboardDefinitions,
      pipeline,
      "observeDashboardDefinitions",
    ),
    logSources: wrapServiceWithPipeline(
      gateway.logSources,
      pipeline,
      "observeLogSources",
    ),
    traceDefinitions: wrapServiceWithPipeline(
      gateway.traceDefinitions,
      pipeline,
      "observeTraceDefinitions",
    ),
    traceSpans: wrapServiceWithPipeline(
      gateway.traceSpans,
      pipeline,
      "observeTraceSpans",
    ),
    incidentReferences: wrapServiceWithPipeline(
      gateway.incidentReferences,
      pipeline,
      "observeIncidentReferences",
    ),
    maintenanceWindows: wrapServiceWithPipeline(
      gateway.maintenanceWindows,
      pipeline,
      "observeMaintenanceWindows",
    ),
    healthSummaries: wrapServiceWithPipeline(
      gateway.healthSummaries,
      pipeline,
      "observeHealthSummaries",
    ),
    metadata: wrapServiceWithPipeline(gateway.metadata, pipeline, "observeMetadata"),
    diagnostics: wrapServiceWithPipeline(
      gateway.diagnostics,
      pipeline,
      "observeDiagnostics",
    ),
  };
}

function buildBundle(input: {
  readonly persistence: ObservePersistenceBundle;
  readonly persistenceMode: "postgres" | "memory";
  readonly now?: () => string;
  readonly id?: () => string;
  readonly eventPublisher?: DomainEventPublisher;
  readonly deliveryHook?: ObserveAlertDeliveryHook;
  readonly env?: Readonly<Record<string, string | undefined>>;
  readonly evaluationMetrics?: ObserveAlertEvaluationMetrics;
}): ObservePlatformServicesBundle {
  createObserveFoundation({ repos: input.persistence });
  let seq = 0;
  const now = input.now ?? (() => new Date().toISOString());
  const id = input.id ?? (() => `obs_${Date.now().toString(36)}_${++seq}`);
  const env = input.env ?? process.env;
  const deliveryHook = input.deliveryHook ?? createNoopObserveAlertDeliveryHook();
  const metrics = input.evaluationMetrics;

  const domain = createPlatformObserveService({
    repos: input.persistence,
    now,
    id,
    persistenceMode: input.persistenceMode,
  });

  const alertEvaluation = createObserveAlertEvaluationDomain({
    repos: input.persistence,
    now,
    id,
    hooks: {
      isEvaluationEnabled: () => isObserveAlertEvaluationEnabled(env),
      metrics,
      deliveryHook: ({ eventId, alertState, definition }) => {
        deliveryHook({ eventId, alertState, definition });
      },
      publishLifecycleEvent: ({ eventId, ctx, alertState, definition }) => {
        const life = readAlertLifecycleMetadata(alertState.metadata);
        const mapped = eventId as ObserveAlertDomainEventId;
        if (
          mapped !== OBSERVE_ALERT_DOMAIN_EVENT_IDS.fired &&
          mapped !== OBSERVE_ALERT_DOMAIN_EVENT_IDS.acknowledged &&
          mapped !== OBSERVE_ALERT_DOMAIN_EVENT_IDS.resolved &&
          mapped !== OBSERVE_ALERT_DOMAIN_EVENT_IDS.suppressed
        ) {
          return { ok: false };
        }
        const result = publishObserveAlertEvent(
          input.eventPublisher,
          {
            tenantId: ctx.tenantId,
            userId: ctx.userId,
            correlationId: ctx.correlationId ?? "observe-eval",
            organisationId: ctx.organisationId,
            permissions: ctx.permissions ?? [],
          },
          mapped,
          {
            alertStateId: alertState.id,
            alertDefinitionId: alertState.alertDefinitionId,
            state: alertState.state,
            severity: definition.severity,
            fingerprint: life?.fingerprint,
            organisationId: alertState.organisationId,
            message: alertState.message,
          },
        );
        return { ok: result.ok };
      },
    },
  });

  const impls = createObservePlatformServiceImpls({ domain, alertEvaluation });
  const gatewaySurface = impls;

  return {
    foundation: input.persistence,
    persistence: input.persistence,
    gatewaySurface,
    impls,
    readiness: {
      observeEnabled: true,
      persistenceMode: input.persistenceMode,
      providerExecutionEnabled: false,
      alertEvaluationEnabled: isObserveAlertEvaluationEnabled(env),
    },
    wrapWithPipeline: (pipeline) =>
      wrapObservePlatformGatewayWithPipeline(gatewaySurface, pipeline),
  };
}

export function createObservePlatformServices(
  input: CreateObservePlatformServicesInput & {
    readonly persistence: ObservePersistenceBundle;
    readonly persistenceMode?: "postgres" | "memory";
  },
): ObservePlatformServicesBundle {
  return buildBundle({
    persistence: input.persistence,
    persistenceMode: input.persistenceMode ?? "memory",
    now: input.now,
    id: input.id,
    eventPublisher: input.eventPublisher,
    deliveryHook: input.deliveryHook,
    env: input.env,
    evaluationMetrics: input.evaluationMetrics,
  });
}

export function createObservePlatformServicesForProduction(
  input: CreateObservePlatformServicesForProductionInput,
): ObservePlatformServicesBundle {
  if (!input?.postgresDb) {
    throw new Error(
      "createObservePlatformServicesForProduction requires postgresDb — in-memory fallback is forbidden",
    );
  }
  const persistence = createProductionObservePersistence({
    db: input.postgresDb,
  });
  return buildBundle({
    persistence,
    persistenceMode: "postgres",
    now: input.now,
    id: input.id,
    eventPublisher: input.eventPublisher,
    deliveryHook: input.deliveryHook,
    env: input.env,
  });
}

export function createObservePlatformServicesForTest(
  input: CreateObservePlatformServicesForTestInput = {},
): ObservePlatformServicesBundle {
  if (!input.postgresDb && !input.allowInMemoryPersistence) {
    throw new Error(
      "createObservePlatformServicesForTest requires postgresDb or allowInMemoryPersistence: true",
    );
  }
  const persistence = createObservePersistenceForTest({
    postgresDb: input.postgresDb,
    allowInMemoryPersistence: input.allowInMemoryPersistence,
  });
  return buildBundle({
    persistence,
    persistenceMode: input.postgresDb ? "postgres" : "memory",
    now: input.now,
    id: input.id,
    eventPublisher: input.eventPublisher,
    deliveryHook: input.deliveryHook,
    env: input.env,
    evaluationMetrics: input.evaluationMetrics,
  });
}
