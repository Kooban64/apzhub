import {
  createKimaiAdapter,
  createMockKimaiFetch,
  disposeKimaiAdapter,
  DEFAULT_TEST_KIMAI_CONFIG,
  TEST_TENANT_ID as KIMAI_TENANT,
} from "@apzhub/integration-kimai";
import type { ServiceRequestContext } from "@apzhub/platform-service-contracts";
import { describe, expect, it } from "vitest";

import { createPlatformServices } from "../create-platform-services";
import {
  createTimePlatformServicesForTest,
  createTimePlatformServicesWithKimai,
} from "./create-time-platform-services";
import { createInMemoryTimeDomainProvider } from "./in-memory-time-domain-provider";
import { PLATFORM_TIME_PERMISSIONS } from "./time-permissions";
import type { TimeOpsProvider } from "./time-types";

function ctx(
  permissions: readonly string[] = [...PLATFORM_TIME_PERMISSIONS],
): ServiceRequestContext {
  return {
    tenantId: "tenant_time",
    userId: "user_time",
    correlationId: "corr_time",
    permissions,
  };
}

function mockOps(overrides?: Partial<TimeOpsProvider>): TimeOpsProvider {
  return {
    getFoundationCapabilities: async () => ({
      adapterId: "mock",
      adapterVersion: "0.0.0",
      domainCrudAvailable: true,
      operations: ["health"],
    }),
    testConnection: async () => ({ ok: true, message: "ok" }),
    getHealth: async () => ({
      status: "healthy",
      checks: [{ name: "mock", status: "pass" }],
      observedAt: new Date().toISOString(),
    }),
    getDiagnostics: async () => ({
      healthStatus: "healthy",
      warnings: [],
      recommendations: [],
      foundationOnly: true,
    }),
    getCompatibility: async () => ({
      compatibilityStatus: "compatible",
      edition: "community",
    }),
    getReadiness: async () => ({
      ready: true,
      classification: "ready",
      blockingFailures: [],
      warnings: [],
    }),
    ...overrides,
  };
}

describe("APZHUB-PLATFORM-TIME-001 platform services", () => {
  it("supports in-memory domain CRUD through pipeline-wrapped gateway", async () => {
    const time = createTimePlatformServicesForTest({ ops: mockOps() });
    const { gateway } = createPlatformServices({
      time,
      authorizationMode: "allow-all",
    });

    const customer = await gateway.time.customers.create(ctx(), { name: "Acme" });
    const project = await gateway.time.projects.create(ctx(), {
      name: "Delivery",
      customerId: customer.id,
    });
    const activity = await gateway.time.activities.create(ctx(), {
      name: "Development",
      projectId: project.id,
    });
    const tag = await gateway.time.tags.create(ctx(), { name: "billable" });
    const timesheet = await gateway.time.timesheets.create(ctx(), {
      description: "Implement Time services",
      projectId: project.id,
      activityId: activity.id,
      tagIds: [tag.id],
    });
    const stopped = await gateway.time.timesheets.stop(ctx(), timesheet.id);

    expect(customer.name).toBe("Acme");
    expect(project.customerId).toBe(customer.id);
    expect(activity.projectId).toBe(project.id);
    expect(stopped.status).toBe("stopped");
    expect(stopped.durationMinutes).toBeGreaterThanOrEqual(0);

    const listed = await gateway.time.timesheets.list(ctx());
    expect(listed.totalCount).toBe(1);

    const reporting = await gateway.time.reporting.getReportingCapabilities(ctx());
    expect(reporting.foundationOnly).toBe(true);
    expect(reporting.unsupported).toContain("exports");
  });

  it("resolves domain provider and rejects missing entities", async () => {
    const domain = createInMemoryTimeDomainProvider();
    const time = createTimePlatformServicesForTest({ ops: mockOps(), domain });
    const { gateway } = createPlatformServices({
      time,
      authorizationMode: "allow-all",
    });

    await expect(gateway.time.activities.get(ctx(), "missing")).rejects.toMatchObject({
      code: "NOT_FOUND",
    });
  });

  it("consumes certified Kimai adapter for foundation ops", async () => {
    const { adapter, factory } = await createKimaiAdapter({
      tenantId: KIMAI_TENANT,
      kimai: DEFAULT_TEST_KIMAI_CONFIG,
      apiToken: "token",
      adapterOptions: { fetchFn: createMockKimaiFetch() },
    });
    await adapter.connect({
      tenantId: KIMAI_TENANT,
      correlationId: "corr_kimai_time",
    });

    const time = createTimePlatformServicesWithKimai(adapter);
    const { gateway } = createPlatformServices({
      time,
      authorizationMode: "allow-all",
    });

    const caps = await gateway.time.tracking.getFoundationCapabilities(ctx());
    expect(caps.adapterId).toBe("kimai-adapter");
    expect(caps.domainCrudAvailable).toBe(true);

    const health = await gateway.time.tracking.getHealth(ctx());
    expect(["healthy", "degraded", "unavailable"]).toContain(health.status);
    expect(health.checks.length).toBeGreaterThan(0);

    const diagnostics = await gateway.time.tracking.getDiagnostics(ctx());
    expect(diagnostics.foundationOnly).toBe(false);
    expect(JSON.stringify(diagnostics)).not.toMatch(/token/);

    const listed = await gateway.time.timesheets.list(ctx());
    expect(listed.items).toEqual([]);

    const created = await gateway.time.timesheets.create(ctx(), {
      description: "Via Kimai domain",
      billable: true,
    });
    expect(created.id).toMatch(/^tts_/);
    expect(created.description).toBe("Via Kimai domain");

    await disposeKimaiAdapter(adapter, factory);
  });

  it("maps time operations to catalogue permissions", async () => {
    const { resolveOperationAuthorization } =
      await import("../../authorization/operation-authorization-map");
    expect(
      resolveOperationAuthorization("timesheet", "create")?.requiredPermission,
    ).toBe("time.timesheet.create");
    expect(
      resolveOperationAuthorization("timeTracking", "getHealth")?.requiredPermission,
    ).toBe("time.view");
    expect(PLATFORM_TIME_PERMISSIONS).toContain("time.manage");
  });
});
