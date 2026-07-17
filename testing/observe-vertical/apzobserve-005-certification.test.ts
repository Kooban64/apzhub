/**
 * APZOBSERVE-005 — Observability vertical certification harness.
 * Ten production-boundary journeys + artefact / classification gates.
 * No new product functionality.
 */
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import {
  isPlatformServiceError,
  type ServiceRequestContext,
} from "@apzhub/platform-service-contracts";
import { PLATFORM_OBSERVE_PERMISSIONS } from "@apzhub/observe-contracts";
import {
  createEmptyObserveInMemoryStores,
  createObservePersistence,
} from "@apzhub/observe-persistence";
import {
  createObservePlatformServicesForProduction,
  createObservePlatformServicesForTest,
  createPlatformServices,
  InMemoryAuthorizationAccessResolver,
  isObserveServiceEnabled,
  resolveOperationAuthorization,
} from "@apzhub/platform-services";

const ROOT = join(__dirname, "../..");

function ctx(
  overrides?: Partial<ServiceRequestContext>,
): ServiceRequestContext {
  return {
    tenantId: "tenant_obs_a",
    userId: "actor_obs",
    organisationId: "org_obs_a",
    correlationId: "corr_apzobserve_005",
    permissions: ["observe.*"],
    ...overrides,
  };
}

function bundle(options?: {
  readonly authorizationMode?: "allow-all" | "production";
  readonly accessResolver?: InMemoryAuthorizationAccessResolver;
}) {
  let seq = 0;
  const observe = createObservePlatformServicesForTest({
    allowInMemoryPersistence: true,
    id: () => `obs_cert_${++seq}`,
  });
  return createPlatformServices({
    observe,
    authorizationMode: options?.authorizationMode ?? "allow-all",
    accessResolver: options?.accessResolver,
  });
}

describe("APZOBSERVE-005 Observability Vertical Certification", () => {
  it("passes vertical architecture audit (0 violations)", () => {
    const output = execFileSync(
      process.execPath,
      [join(ROOT, "scripts/apzobserve-005-observe-vertical-audit.mjs")],
      { cwd: ROOT, encoding: "utf8" },
    );
    expect(output).toContain("RESULT: PASS");
    expect(output).toContain("Violations: 0");
  });

  it("Journey 1 — health metadata lifecycle (no probe execution)", async () => {
    const observe = bundle().gateway.observe;
    const created = await observe.healthChecks.create(ctx(), {
      serviceKey: "platform-api",
      name: "Cert health check",
      status: "unknown",
      providerKind: "internal",
    } as never);
    expect(created.id).toBeTruthy();
    expect(created.status).toBe("unknown");
    expect(created).not.toHaveProperty("probeResult");
    expect(created).not.toHaveProperty("lastProbeAt");

    const read = await observe.healthChecks.get(ctx(), created.id);
    expect(read.name).toBe("Cert health check");

    const updated = await observe.healthChecks.update(ctx(), {
      id: created.id,
      name: "Cert health check updated",
      status: "healthy",
    } as never);
    expect(updated.name).toBe("Cert health check updated");
    expect(updated.revision).toBeGreaterThanOrEqual(created.revision);

    const listed = await observe.healthChecks.list(ctx());
    expect(listed.some((item) => item.id === created.id)).toBe(true);

    // Authorization enforced on production mode
    const denied = bundle({
      authorizationMode: "production",
      accessResolver: new InMemoryAuthorizationAccessResolver(),
    });
    await expect(
      denied.gateway.observe.healthChecks.create(
        ctx({ permissions: [] }),
        {
          serviceKey: "x",
          name: "Nope",
          status: "unknown",
          providerKind: "internal",
        } as never,
      ),
    ).rejects.toSatisfy((error: unknown) => isPlatformServiceError(error));

    const servicesSource = readFileSync(
      join(
        ROOT,
        "packages/platform-services/src/services/observe/observe-service-impls.ts",
      ),
      "utf8",
    );
    expect(servicesSource).not.toMatch(
      /\b(executeProbe|runHealthProbe|scrapeTarget)\s*\(/,
    );
  });

  it("Journey 2 — readiness and liveness remain distinct", async () => {
    const observe = bundle().gateway.observe;
    const readiness = await observe.readinessChecks.create(ctx(), {
      serviceKey: "platform-api",
      name: "Ready check",
      status: "ready",
      providerKind: "internal",
    } as never);
    const liveness = await observe.livenessChecks.create(ctx(), {
      serviceKey: "platform-api",
      name: "Alive check",
      status: "alive",
      providerKind: "internal",
    } as never);

    expect(readiness.id).not.toBe(liveness.id);
    expect((await observe.readinessChecks.get(ctx(), readiness.id)).status).toBe(
      "ready",
    );
    expect((await observe.livenessChecks.get(ctx(), liveness.id)).status).toBe(
      "alive",
    );
    expect(
      (await observe.readinessChecks.list(ctx())).some((r) => r.id === liveness.id),
    ).toBe(false);
    expect(
      (await observe.livenessChecks.list(ctx())).some((r) => r.id === readiness.id),
    ).toBe(false);

    expect(
      resolveOperationAuthorization("observeReadinessChecks", "create")
        ?.requiredPermission,
    ).toBe("observe.health");
    expect(
      resolveOperationAuthorization("observeLivenessChecks", "list")
        ?.requiredPermission,
    ).toBe("observe.health");

    const view = readFileSync(
      join(ROOT, "apps/web/components/observe/platform-observability-view.tsx"),
      "utf8",
    );
    expect(view).toContain("readiness-checks");
    expect(view).toContain("liveness-checks");
    expect(view).toMatch(/distinct from liveness|Readiness metadata/i);
  });

  it("Journey 3 — service and component status (canonical, no live probe)", async () => {
    const observe = bundle().gateway.observe;
    const serviceHealth = await observe.serviceHealth.create(ctx(), {
      serviceKey: "platform-api",
      displayName: "Platform API",
      overallStatus: "unknown",
      readinessStatus: "unknown",
      livenessStatus: "unknown",
    } as never);
    expect(serviceHealth.overallStatus).toBe("unknown");
    expect(serviceHealth.overallStatus).not.toBe("healthy");

    const serviceStatus = await observe.serviceStatus.create(ctx(), {
      serviceKey: "platform-api",
      status: "degraded",
    } as never);
    expect(serviceStatus.status).toBe("degraded");

    const component = await observe.componentStatus.create(ctx(), {
      serviceKey: "platform-api",
      componentKey: "db",
      name: "Database",
      status: "unknown",
    } as never);
    expect(component.serviceKey).toBe("platform-api");
    expect(component.status).toBe("unknown");

    const stores = createEmptyObserveInMemoryStores();
    const repos = createObservePersistence({ mode: "memory", stores });
    const ctxA = { tenantId: "tenant_a", userId: "a" };
    const ctxB = { tenantId: "tenant_b", userId: "b" };
    const now = "2026-07-17T00:00:00.000Z";
    await repos.healthChecks.create(ctxA, {
      id: "hc_a",
      tenantId: "tenant_a",
      serviceKey: "web",
      name: "A",
      status: "healthy",
      providerKind: "internal",
      createdAt: now,
      updatedAt: now,
      createdBy: "a",
      updatedBy: "a",
      revision: 1,
    } as never);
    await repos.healthChecks.create(ctxB, {
      id: "hc_b",
      tenantId: "tenant_b",
      serviceKey: "web",
      name: "B",
      status: "healthy",
      providerKind: "internal",
      createdAt: now,
      updatedAt: now,
      createdBy: "b",
      updatedBy: "b",
      revision: 1,
    } as never);
    expect((await repos.healthChecks.list(ctxA)).map((r) => r.id)).toEqual([
      "hc_a",
    ]);
    expect(await repos.healthChecks.get(ctxA, "hc_b")).toBeNull();
  });

  it("Journey 4 — metrics metadata (no PromQL / collection)", async () => {
    const observe = bundle().gateway.observe;
    const definition = await observe.metricDefinitions.create(ctx(), {
      key: "requests_total",
      name: "Requests",
      kind: "counter",
      unit: "count",
      providerKind: "prometheus",
      status: "draft",
    } as never);
    expect(definition.kind).toBe("counter");
    expect(definition).not.toHaveProperty("promql");
    expect(definition).not.toHaveProperty("query");

    const updated = await observe.metricDefinitions.update(ctx(), {
      id: definition.id,
      name: "Requests updated",
      status: "active",
    } as never);
    expect(updated.status).toBe("active");

    const sample = await observe.metricSamples.create(ctx(), {
      metricDefinitionId: definition.id,
      sampledAt: "2026-07-17T12:00:00.000Z",
      providerKind: "prometheus",
      valueLabel: "42",
    } as never);
    expect(sample.metricDefinitionId).toBe(definition.id);

    expect(
      resolveOperationAuthorization("observeMetricDefinitions", "create")
        ?.requiredPermission,
    ).toBe("observe.metrics");

    const view = readFileSync(
      join(ROOT, "apps/web/components/observe/platform-observability-view.tsx"),
      "utf8",
    );
    expect(view).toMatch(/no PromQL|not a time-series/i);
  });

  it("Journey 5 — alert metadata lifecycle (no evaluation/delivery)", async () => {
    const observe = bundle().gateway.observe;
    const definition = await observe.alertDefinitions.create(ctx(), {
      key: "high_errors",
      name: "High errors",
      severity: "warning",
      providerKind: "alertmanager",
      status: "draft",
    } as never);
    expect(definition.severity).toBe("warning");
    expect(definition).not.toHaveProperty("notificationChannel");

    const updated = await observe.alertDefinitions.update(ctx(), {
      id: definition.id,
      status: "active",
      severity: "critical",
    } as never);
    expect(updated.severity).toBe("critical");

    const state = await observe.alertStates.create(ctx(), {
      alertDefinitionId: definition.id,
      state: "inactive",
      providerKind: "alertmanager",
    } as never);
    expect(state.alertDefinitionId).toBe(definition.id);
    expect(state.state).toBe("inactive");
    expect(state.id).not.toBe(definition.id);

    expect(
      resolveOperationAuthorization("observeAlertDefinitions", "update")
        ?.requiredPermission,
    ).toBe("observe.alerts");

    const impl = readFileSync(
      join(
        ROOT,
        "packages/platform-services/src/services/observe/observe-service-impls.ts",
      ),
      "utf8",
    );
    expect(impl).not.toMatch(/\b(evaluateAlert|deliverNotification|sendAlert)\s*\(/);
  });

  it("Journey 6 — logs and traces metadata (no ingestion)", async () => {
    const observe = bundle().gateway.observe;
    const logSource = await observe.logSources.create(ctx(), {
      key: "app",
      name: "Application",
      kind: "application",
      providerKind: "loki",
      status: "draft",
    } as never);
    expect(logSource).not.toHaveProperty("password");
    expect(logSource).not.toHaveProperty("apiKey");
    expect(JSON.stringify(logSource)).not.toMatch(
      /bearer|webhookSecret|connectionString/i,
    );

    const traceDef = await observe.traceDefinitions.create(ctx(), {
      key: "http",
      name: "HTTP traces",
      providerKind: "opentelemetry",
      status: "draft",
    } as never);
    const span = await observe.traceSpans.create(ctx(), {
      traceDefinitionId: traceDef.id,
      spanName: "handler",
      serviceKey: "platform-api",
      providerKind: "opentelemetry",
    } as never);
    expect(span.traceDefinitionId).toBe(traceDef.id);

    expect(
      resolveOperationAuthorization("observeLogSources", "create")
        ?.requiredPermission,
    ).toBe("observe.logs");
    expect(
      resolveOperationAuthorization("observeTraceDefinitions", "list")
        ?.requiredPermission,
    ).toBe("observe.traces");
  });

  it("Journey 7 — incidents and maintenance windows (metadata only)", async () => {
    const observe = bundle().gateway.observe;
    const incident = await observe.incidentReferences.create(ctx(), {
      key: "inc-cert-1",
      title: "External incident",
      status: "draft",
      serviceKey: "platform-api",
    } as never);
    expect(incident.key).toBe("inc-cert-1");
    expect(incident).not.toHaveProperty("workflowState");
    expect(incident).not.toHaveProperty("runbookExecuted");

    const window = await observe.maintenanceWindows.create(ctx(), {
      key: "mw-cert-1",
      name: "Window",
      startsAt: "2026-07-17T10:00:00.000Z",
      endsAt: "2026-07-17T12:00:00.000Z",
      status: "draft",
      serviceKeys: ["platform-api"],
    } as never);
    expect(window.startsAt).toBeTruthy();
    expect(window).not.toHaveProperty("alertsSuppressed");

    await observe.maintenanceWindows.update(ctx(), {
      id: window.id,
      status: "active",
    } as never);
    expect(
      (await observe.maintenanceWindows.get(ctx(), window.id)).status,
    ).toBe("active");

    expect(
      resolveOperationAuthorization("observeMaintenanceWindows", "create")
        ?.requiredPermission,
    ).toBe("observe.manage");
  });

  it("Journey 8 — authorization and isolation matrix", async () => {
    const accessResolver = new InMemoryAuthorizationAccessResolver();
    const baseSnapshot = {
      subject: { userId: "actor_obs", status: "active" as const },
      tenantMemberships: [
        { tenantId: "tenant_obs_a", status: "active" as const, isPrimary: true },
      ],
      organisationMemberships: [
        {
          organisationId: "org_obs_a",
          tenantId: "tenant_obs_a",
          status: "active" as const,
        },
      ],
      roleIds: ["role-observe-admin"],
      roleSlugs: ["observe-admin"],
      denyPermissions: [] as string[],
      isPlatformAdministrator: false,
    };

    accessResolver.set("actor_obs", "tenant_obs_a", {
      ...baseSnapshot,
      allowPermissions: [],
    });
    const observeBundle = createObservePlatformServicesForTest({
      allowInMemoryPersistence: true,
    });
    const services = createPlatformServices({
      observe: observeBundle,
      authorizationMode: "production",
      accessResolver,
    });
    const gw = services.gateway.observe;

    await expect(gw.healthChecks.list(ctx())).rejects.toSatisfy(
      (error: unknown) => isPlatformServiceError(error),
    );

    accessResolver.set("actor_obs", "tenant_obs_a", {
      ...baseSnapshot,
      allowPermissions: ["observe.read"],
    });
    await expect(
      gw.healthChecks.create(ctx(), {
        serviceKey: "x",
        name: "Nope",
        status: "unknown",
        providerKind: "internal",
      } as never),
    ).rejects.toSatisfy((error: unknown) => isPlatformServiceError(error));

    accessResolver.set("actor_obs", "tenant_obs_a", {
      ...baseSnapshot,
      allowPermissions: ["observe.health"],
    });
    const created = await gw.healthChecks.create(ctx(), {
      serviceKey: "platform-api",
      name: "Allowed",
      status: "unknown",
      providerKind: "internal",
    } as never);
    expect(created.id).toBeTruthy();

    expect(
      resolveOperationAuthorization("observeDiagnostics", "health")
        ?.requiredPermission,
    ).toBe("observe.diagnostics");
    expect(
      resolveOperationAuthorization("observeMetricDefinitions", "list")
        ?.requiredPermission,
    ).toBe("observe.metrics");
    for (const permission of PLATFORM_OBSERVE_PERMISSIONS) {
      expect(permission.startsWith("observe")).toBe(true);
    }
  });

  it("Journey 9 — disabled service and no silent persistence fallback", () => {
    expect(isObserveServiceEnabled({})).toBe(false);
    expect(isObserveServiceEnabled({ APZHUB_OBSERVE_ENABLED: "false" })).toBe(
      false,
    );
    expect(isObserveServiceEnabled({ APZHUB_OBSERVE_ENABLED: "true" })).toBe(
      true,
    );

    const withoutObserve = createPlatformServices({
      authorizationMode: "allow-all",
    });
    expect(() => withoutObserve.gateway.observe.healthChecks.list(ctx())).toThrow(
      /not enabled/,
    );

    expect(() => createObservePlatformServicesForTest({} as never)).toThrow(
      /allowInMemoryPersistence/,
    );
    expect(() =>
      createObservePlatformServicesForProduction({} as never),
    ).toThrow(/postgresDb/);

    const handler = readFileSync(
      join(ROOT, "apps/web/lib/api/v1/handlers/observe.ts"),
      "utf8",
    );
    expect(handler).toContain("OBSERVE_SERVICE_UNAVAILABLE");
    expect(handler).toContain("503");

    const view = readFileSync(
      join(ROOT, "apps/web/components/observe/platform-observability-view.tsx"),
      "utf8",
    );
    expect(view).toContain("observability-unavailable");
    expect(view).toMatch(/OBSERVE_SERVICE_UNAVAILABLE|isUnavailable/);
  });

  it("Journey 10 — Workbench production path artefacts", () => {
    expect(
      existsSync(
        join(
          ROOT,
          "packages/workbench-framework/manifests/platform-observability/module.yaml",
        ),
      ),
    ).toBe(true);
    const parent = readFileSync(
      join(
        ROOT,
        "packages/workbench-framework/manifests/platform-observability/module.yaml",
      ),
      "utf8",
    );
    expect(parent).toContain("/workspace/observability");
    expect(parent).toContain("observe.read");
    expect(parent).toContain("order: 54");

    const shell = readFileSync(
      join(ROOT, "apps/web/components/workbench-page.tsx"),
      "utf8",
    );
    expect(shell).toContain("ObserveWorkspaceRouter");
    expect(shell).toContain("isObserveRoute");
    expect(existsSync(join(ROOT, "apps/web/app/workspace/observability"))).toBe(
      false,
    );

    const view = readFileSync(
      join(ROOT, "apps/web/components/observe/platform-observability-view.tsx"),
      "utf8",
    );
    expect(view).toContain("GRAFANA INTEGRATION NOT AVAILABLE");
    expect(view).toContain("PROMETHEUS INTEGRATION NOT AVAILABLE");
    expect(view).toContain("LIVE METRICS COLLECTION NOT AVAILABLE");
    expect(view).toContain("observe-api");
    expect(view).not.toMatch(/@apzhub\/platform-services|getPlatformServiceGateway/);
    expect(view).not.toMatch(/@apzhub\/observe-core|@apzhub\/observe-persistence/);
    expect(view).not.toMatch(/\bfetch\s*\(/);

    const client = readFileSync(
      join(ROOT, "apps/web/lib/observe/observe-client.ts"),
      "utf8",
    );
    expect(client).toContain("createHttpObserveClient");
    expect(client).toContain("/api/v1/observe");
    expect(client).not.toMatch(/\/api\/v1\/(?!observe)/);

    const routeCount = readdirSync(
      join(ROOT, "apps/web/app/api/v1/observe"),
      { recursive: true },
    ).filter((name) => String(name).endsWith("route.ts")).length;
    expect(routeCount).toBeGreaterThanOrEqual(30);

    const openapi = readFileSync(
      join(ROOT, "docs/specs/APZHUB-Platform-OpenAPI-v1.yaml"),
      "utf8",
    );
    expect(openapi).toContain("Platform Observability Administration");
    expect(openapi).toMatch(/version:\s*1\.8\.\d+/);
  });

  it("classifies PRODUCTION_READY_WITH_LIMITATIONS and recommends APZOBSERVE-006 only", () => {
    const completion = readFileSync(
      join(ROOT, "docs/sprint/APZOBSERVE-005-completion-report.md"),
      "utf8",
    );
    const readiness = readFileSync(
      join(ROOT, "docs/reviews/APZOBSERVE-005-Production-Readiness.md"),
      "utf8",
    );
    expect(completion).toContain("PRODUCTION_READY_WITH_LIMITATIONS");
    expect(readiness).toContain("PRODUCTION_READY_WITH_LIMITATIONS");
    expect(completion).toContain("APZOBSERVE-006");
    expect(completion).toMatch(/do not implement|await owner/i);
    expect(completion).not.toContain("APZOBSERVE-007");
  });
});
