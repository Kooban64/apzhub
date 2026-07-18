import { describe, expect, it } from "vitest";

import {
  asAlertDefinitionId,
  asHealthCheckId,
  asMetricDefinitionId,
  asServiceHealthId,
  type HealthCheck,
  type MetricDefinition,
  type ServiceHealth,
} from "@apzhub/observe-contracts";

import {
  OBSERVE_CORE_VERSION,
  ObserveDomainError,
  assertNoCredentialPayload,
  assertObserveAlertStateTransition,
  assertObserveHealthTransition,
  assertObserveMetadataTransition,
  assertAlertStateKind,
  canTransitionObserveAlertState,
  canTransitionObserveHealth,
  canTransitionObserveMetadata,
  createObserveFoundation,
  createPlatformObserveService,
  listAllowedObserveHealthTransitions,
  requireFound,
  validateAlertDefinition,
  validateHealthCheck,
  validateMetricDefinition,
  validateServiceHealth,
} from "./index";
import type { ObserveFoundationRepos } from "./ports/repository-ports";

const now = "2026-07-17T00:00:00.000Z";

function healthCheck(overrides?: Partial<HealthCheck>): HealthCheck {
  return {
    id: asHealthCheckId("hc_1"),
    tenantId: "tenant_a",
    serviceKey: "platform-services",
    name: "Platform Services Health",
    status: "healthy",
    providerKind: "internal",
    createdAt: now,
    updatedAt: now,
    createdBy: "actor",
    updatedBy: "actor",
    revision: 1,
    ...overrides,
  };
}

function stubRepos(): ObserveFoundationRepos {
  const noop = {
    async create(_ctx: unknown, entity: unknown) {
      return entity;
    },
    async get() {
      return null;
    },
    async update(_ctx: unknown, entity: unknown) {
      return entity;
    },
    async list() {
      return [];
    },
  };
  return {
    healthChecks: noop as never,
    readinessChecks: noop as never,
    livenessChecks: noop as never,
    serviceHealth: noop as never,
    serviceStatuses: noop as never,
    componentStatuses: noop as never,
    metricDefinitions: noop as never,
    metricSamples: noop as never,
    alertDefinitions: noop as never,
    alertStates: noop as never,
    dashboards: noop as never,
    logSources: noop as never,
    traceDefinitions: noop as never,
    traceSpans: noop as never,
    incidentReferences: noop as never,
    maintenanceWindows: noop as never,
    healthSummaries: noop as never,
    diagnostics: noop as never,
    metadata: noop as never,
  };
}

describe("observe-core", () => {
  it("exports core version 0.2.0", () => {
    expect(OBSERVE_CORE_VERSION).toBe("0.2.0");
  });

  it("validates health, service health, metrics, and alerts", () => {
    expect(validateHealthCheck(healthCheck()).status).toBe("healthy");
    expect(() => validateHealthCheck(healthCheck({ name: "  " }))).toThrow(
      /name is required/,
    );
    expect(() => validateHealthCheck(healthCheck({ id: "" as never }))).toThrow(
      /id is invalid/,
    );
    expect(() =>
      validateHealthCheck(healthCheck({ status: "firing" as never })),
    ).toThrow(/status is invalid/);
    expect(() =>
      validateHealthCheck(healthCheck({ providerKind: "x" as never })),
    ).toThrow(/providerKind is invalid/);

    const service: ServiceHealth = {
      id: asServiceHealthId("sh_1"),
      tenantId: "tenant_a",
      serviceKey: "web",
      displayName: "Web",
      overallStatus: "degraded",
      readinessStatus: "ready",
      livenessStatus: "alive",
      createdAt: now,
      updatedAt: now,
      createdBy: "actor",
      updatedBy: "actor",
      revision: 1,
    };
    expect(validateServiceHealth(service).overallStatus).toBe("degraded");
    expect(() =>
      validateServiceHealth({ ...service, overallStatus: "nope" as never }),
    ).toThrow(/overallStatus is invalid/);

    const metric: MetricDefinition = {
      id: asMetricDefinitionId("md_1"),
      tenantId: "tenant_a",
      key: "http_requests_total",
      name: "HTTP Requests",
      kind: "counter",
      providerKind: "prometheus",
      status: "active",
      createdAt: now,
      updatedAt: now,
      createdBy: "actor",
      updatedBy: "actor",
      revision: 1,
    };
    expect(validateMetricDefinition(metric).kind).toBe("counter");
    expect(() => validateMetricDefinition({ ...metric, kind: "bad" as never })).toThrow(
      /kind is invalid/,
    );
    expect(() =>
      validateMetricDefinition({ ...metric, status: "bad" as never }),
    ).toThrow(/status is invalid/);

    expect(
      validateAlertDefinition({
        id: asAlertDefinitionId("ad_1"),
        tenantId: "tenant_a",
        key: "high_error_rate",
        name: "High error rate",
        severity: "critical",
        providerKind: "alertmanager",
        status: "active",
        createdAt: now,
        updatedAt: now,
        createdBy: "actor",
        updatedBy: "actor",
        revision: 1,
      }).severity,
    ).toBe("critical");
    expect(() =>
      validateAlertDefinition({
        id: asAlertDefinitionId("ad_2"),
        tenantId: "tenant_a",
        key: "x",
        name: "X",
        severity: "bad" as never,
        providerKind: "internal",
        status: "active",
        createdAt: now,
        updatedAt: now,
        createdBy: "actor",
        updatedBy: "actor",
        revision: 1,
      }),
    ).toThrow(/severity is invalid/);
    expect(() =>
      validateAlertDefinition({
        id: asAlertDefinitionId("ad_3"),
        tenantId: "tenant_a",
        key: "y",
        name: "Y",
        severity: "info",
        providerKind: "internal",
        status: "bad" as never,
        createdAt: now,
        updatedAt: now,
        createdBy: "actor",
        updatedBy: "actor",
        revision: 1,
      }),
    ).toThrow(/status is invalid/);
  });

  it("enforces health, alert, and metadata lifecycle transitions fail-closed", () => {
    expect(canTransitionObserveHealth("healthy", "degraded")).toBe(true);
    expect(canTransitionObserveHealth("healthy", "healthy")).toBe(true);
    expect(canTransitionObserveHealth("degraded", "healthy")).toBe(true);
    expect(canTransitionObserveHealth("unhealthy", "maintenance")).toBe(true);
    expect(canTransitionObserveHealth("maintenance", "unknown")).toBe(true);
    expect(() => assertObserveHealthTransition("healthy", "healthy")).not.toThrow();
    expect(() => assertObserveHealthTransition("unknown", "firing" as never)).toThrow(
      /Invalid health/,
    );
    expect(listAllowedObserveHealthTransitions("healthy")).toContain("degraded");
    expect(listAllowedObserveHealthTransitions("unknown" as never)).toEqual(
      expect.any(Array),
    );

    expect(canTransitionObserveAlertState("firing", "resolved")).toBe(true);
    expect(canTransitionObserveAlertState("pending", "silenced")).toBe(true);
    expect(canTransitionObserveAlertState("silenced", "firing")).toBe(true);
    expect(() => assertObserveAlertStateTransition("resolved", "silenced")).toThrow(
      /Invalid alert state/,
    );
    expect(canTransitionObserveAlertState("inactive", "inactive")).toBe(true);
    expect(canTransitionObserveAlertState("unknown" as never, "firing")).toBe(false);

    expect(canTransitionObserveMetadata("draft", "active")).toBe(true);
    expect(canTransitionObserveMetadata("active", "inactive")).toBe(true);
    expect(canTransitionObserveMetadata("inactive", "archived")).toBe(true);
    expect(canTransitionObserveMetadata("archived", "active")).toBe(false);
    expect(canTransitionObserveMetadata("draft", "draft")).toBe(true);
    expect(() => assertObserveMetadataTransition("archived", "active")).toThrow(
      /Invalid metadata/,
    );
    expect(canTransitionObserveMetadata("unknown" as never, "active")).toBe(false);
    expect(() => assertAlertStateKind("firing")).not.toThrow();
    expect(() => assertAlertStateKind("nope")).toThrow(/alert state is invalid/);
  });

  it("forbids credential metadata payloads", () => {
    expect(() => assertNoCredentialPayload({ apiKey: "secret" })).toThrow(
      /must not include credential field/,
    );
    expect(() => assertNoCredentialPayload({ passwordHash: "x" })).toThrow(
      /must not include credential field/,
    );
    expect(() => assertNoCredentialPayload({ region: "eu" })).not.toThrow();
    expect(() => assertNoCredentialPayload(undefined)).not.toThrow();
  });

  it("requires explicit repos for foundation (no silent memory)", () => {
    expect(() => createObserveFoundation({} as never)).toThrow(/explicit repos/);
    expect(() =>
      createObserveFoundation({
        repos: { healthChecks: stubRepos().healthChecks } as never,
      }),
    ).toThrow(/requires explicit repos/);

    const foundation = createObserveFoundation({ repos: stubRepos() });
    expect(foundation.repos.healthChecks).toBeDefined();
    expect(foundation.validateHealthCheck(healthCheck()).name).toBe(
      "Platform Services Health",
    );

    const service = createPlatformObserveService({
      repos: foundation.repos,
      now: () => now,
      id: () => "obs_gen_1",
      persistenceMode: "memory",
    });
    expect(typeof service.listHealthChecks).toBe("function");
    expect(typeof service.diagnosticsHealth).toBe("function");
  });

  it("requireFound throws ObserveDomainError", () => {
    expect(requireFound("x", "HealthCheck", "1")).toBe("x");
    expect(() => requireFound(null, "HealthCheck", "missing")).toThrow(
      ObserveDomainError,
    );
  });
});
