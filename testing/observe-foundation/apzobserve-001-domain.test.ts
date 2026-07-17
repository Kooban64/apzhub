import { describe, expect, it } from "vitest";

import {
  asAlertDefinitionId,
  asAlertStateId,
  asHealthCheckId,
  asMetricDefinitionId,
  asObservabilityMetadataId,
  type ObserveRequestContext,
} from "@apzhub/observe-contracts";
import {
  assertObserveAlertStateTransition,
  assertObserveHealthTransition,
  createObserveFoundation,
  validateAlertDefinition,
  validateHealthCheck,
  validateMetricDefinition,
} from "@apzhub/observe-core";
import { createObservePersistenceForTest } from "@apzhub/observe-persistence";

const ctx: ObserveRequestContext = {
  tenantId: "tenant_a",
  userId: "user_1",
  correlationId: "corr_observe_001",
};

const now = "2026-07-17T12:00:00.000Z";

describe("APZOBSERVE-001 domain / health / alert / metadata harness", () => {
  it("composes foundation with persistence and exercises health + alerts + metadata", async () => {
    const repos = createObservePersistenceForTest({
      allowInMemoryPersistence: true,
    });
    const foundation = createObserveFoundation({ repos });

    const health = validateHealthCheck({
      id: asHealthCheckId("hc_domain_1"),
      tenantId: "tenant_a",
      serviceKey: "gateway",
      name: "Gateway",
      status: "healthy",
      providerKind: "internal",
      createdAt: now,
      updatedAt: now,
      createdBy: "user_1",
      updatedBy: "user_1",
      revision: 1,
    });
    foundation.assertNoCredentialPayload(health.metadata);
    assertObserveHealthTransition("healthy", "degraded");
    await repos.healthChecks.create(ctx, {
      ...health,
      status: "degraded",
    });

    const metric = validateMetricDefinition({
      id: asMetricDefinitionId("md_domain_1"),
      tenantId: "tenant_a",
      key: "gateway_latency_ms",
      name: "Gateway latency",
      kind: "histogram",
      providerKind: "prometheus",
      status: "active",
      createdAt: now,
      updatedAt: now,
      createdBy: "user_1",
      updatedBy: "user_1",
      revision: 1,
    });
    await repos.metricDefinitions.create(ctx, metric);

    const alert = validateAlertDefinition({
      id: asAlertDefinitionId("ad_domain_1"),
      tenantId: "tenant_a",
      key: "gateway_down",
      name: "Gateway down",
      severity: "critical",
      providerKind: "alertmanager",
      status: "active",
      createdAt: now,
      updatedAt: now,
      createdBy: "user_1",
      updatedBy: "user_1",
      revision: 1,
    });
    await repos.alertDefinitions.create(ctx, alert);
    assertObserveAlertStateTransition("inactive", "firing");
    await repos.alertStates.create(ctx, {
      id: asAlertStateId("as_domain_1"),
      tenantId: "tenant_a",
      alertDefinitionId: alert.id,
      state: "firing",
      providerKind: "alertmanager",
      createdAt: now,
      updatedAt: now,
      createdBy: "user_1",
      updatedBy: "user_1",
      revision: 1,
    });

    await repos.metadata.create(ctx, {
      id: asObservabilityMetadataId("om_domain_1"),
      tenantId: "tenant_a",
      key: "observe.foundation",
      name: "Foundation",
      category: "platform",
      status: "active",
      payload: { milestone: "APZOBSERVE-001" },
      createdAt: now,
      updatedAt: now,
      createdBy: "user_1",
      updatedBy: "user_1",
      revision: 1,
    });

    expect(await repos.healthChecks.list(ctx)).toHaveLength(1);
    expect(await repos.metricDefinitions.list(ctx)).toHaveLength(1);
    expect(await repos.alertDefinitions.list(ctx)).toHaveLength(1);
    expect(await repos.alertStates.list(ctx)).toHaveLength(1);
    expect(await repos.metadata.list(ctx)).toHaveLength(1);
  });
});
