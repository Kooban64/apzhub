/**
 * APZWORKFLOW-007 — n8n Platform Services Integration.
 */

import { describe, expect, it } from "vitest";

import {
  createN8nAdapter,
  createMockN8nFetch,
  DEFAULT_TEST_N8N_CONFIG,
  disposeN8nAdapter,
} from "@apzhub/integration-n8n";
import {
  isPlatformServiceError,
  type ServiceRequestContext,
} from "@apzhub/platform-service-contracts";
import {
  hasWorkflowEnginePermission,
  PLATFORM_WORKFLOW_PERMISSIONS,
} from "@apzhub/workflow-contracts";

import {
  createDefaultProductionPolicies,
  createPlatformServices,
  createWorkflowEngineServicesForProduction,
  createWorkflowEngineServicesForTest,
  createWorkflowPlatformServicesForTest,
  InMemoryAuthorizationAccessResolver,
  InMemoryAuthorizationAuditSink,
  PLATFORM_SERVICE_PERMISSION_CATALOGUE,
  PLATFORM_SERVICES_VERSION,
  ProductionAuthorizationProvider,
  RequestPipeline,
  resolveOperationAuthorization,
} from "../../index";
import {
  AUTH_TEST_TENANT_A,
  buildActiveSnapshot,
  buildServiceContext,
} from "../../testing/authorization-fixtures";

function ctx(overrides?: Partial<ServiceRequestContext>): ServiceRequestContext {
  return {
    tenantId: "tenant_wf_engine",
    userId: "user_wf_engine",
    organisationId: "org_wf_engine",
    correlationId: "corr_apzworkflow_007",
    permissions: ["workflow.engine.*"],
    ...overrides,
  };
}

async function withMockAdapter() {
  const result = await createN8nAdapter({
    tenantId: "tenant_wf_engine",
    n8n: DEFAULT_TEST_N8N_CONFIG,
    apiKey: "test-key",
    adapterOptions: { fetchFn: createMockN8nFetch() },
  });
  return {
    adapter: result.adapter,
    async dispose() {
      await disposeN8nAdapter(result.adapter, result.factory);
    },
  };
}

describe("APZWORKFLOW-007 n8n platform services", () => {
  it("exports platform services version 0.26.1", () => {
    expect(PLATFORM_SERVICES_VERSION).toBe("0.32.0");
  });

  it("registers workflow.engine permissions in the platform catalogue", () => {
    for (const permission of [
      "workflow.engine.*",
      "workflow.engine.read",
      "workflow.engine.health",
      "workflow.engine.diagnostics",
      "workflow.engine.capabilities",
    ] as const) {
      expect(PLATFORM_WORKFLOW_PERMISSIONS).toContain(permission);
      expect(PLATFORM_SERVICE_PERMISSION_CATALOGUE).toContain(permission);
    }
  });

  it("maps every public engine gateway method", () => {
    const engine = createWorkflowEngineServicesForTest({
      allowUnavailableEngine: true,
    });
    const facets = Object.keys(
      engine.gatewaySurface,
    ) as (keyof typeof engine.gatewaySurface)[];
    expect(facets).toEqual(
      expect.arrayContaining([
        "workflows",
        "templates",
        "tags",
        "users",
        "projects",
        "capabilities",
        "health",
        "diagnostics",
        "compatibility",
        "connection",
      ]),
    );
    for (const facet of facets) {
      const serviceName =
        facet === "workflows"
          ? "workflowEngineWorkflows"
          : facet === "templates"
            ? "workflowEngineTemplates"
            : facet === "tags"
              ? "workflowEngineTags"
              : facet === "users"
                ? "workflowEngineUsers"
                : facet === "projects"
                  ? "workflowEngineProjects"
                  : facet === "capabilities"
                    ? "workflowEngineCapabilities"
                    : facet === "health"
                      ? "workflowEngineHealth"
                      : facet === "diagnostics"
                        ? "workflowEngineDiagnostics"
                        : facet === "compatibility"
                          ? "workflowEngineCompatibility"
                          : "workflowEngineConnection";
      const service = engine.gatewaySurface[facet] as object;
      for (const method of Object.keys(service)) {
        expect(
          resolveOperationAuthorization(serviceName, method),
          `${serviceName}.${method} must be mapped`,
        ).toBeDefined();
      }
    }
  });

  it("maps engine gateway operations to Production Authorization permissions", () => {
    expect(
      resolveOperationAuthorization("workflowEngineWorkflows", "list")
        ?.requiredPermission,
    ).toBe("workflow.engine.read");
    expect(
      resolveOperationAuthorization("workflowEngineCapabilities", "get")
        ?.requiredPermission,
    ).toBe("workflow.engine.capabilities");
    expect(
      resolveOperationAuthorization("workflowEngineHealth", "get")?.requiredPermission,
    ).toBe("workflow.engine.health");
    expect(
      resolveOperationAuthorization("workflowEngineDiagnostics", "get")
        ?.requiredPermission,
    ).toBe("workflow.engine.diagnostics");
    expect(
      resolveOperationAuthorization("workflowEngineCompatibility", "get")
        ?.requiredPermission,
    ).toBe("workflow.engine.capabilities");
    expect(
      resolveOperationAuthorization("workflowEngineConnection", "validate")
        ?.requiredPermission,
    ).toBe("workflow.engine.health");
  });

  it("hasWorkflowEnginePermission respects wildcards", () => {
    expect(hasWorkflowEnginePermission(["workflow.engine.*"], "read")).toBe(true);
    expect(hasWorkflowEnginePermission(["workflow.*"], "health")).toBe(true);
    expect(hasWorkflowEnginePermission(["workflow.engine.read"], "read")).toBe(true);
    expect(hasWorkflowEnginePermission(["workflow.engine.read"], "diagnostics")).toBe(
      false,
    );
  });

  it("production engine factory requires adapter", () => {
    expect(() =>
      createWorkflowEngineServicesForProduction({
        adapter: undefined as never,
      }),
    ).toThrow(/requires adapter/);
  });

  it("test engine factory requires adapter or allowUnavailableEngine", () => {
    expect(() => createWorkflowEngineServicesForTest({})).toThrow(
      /requires adapter or allowUnavailableEngine/,
    );
  });

  it("unavailable engine rejects with PlatformServiceError", async () => {
    const engine = createWorkflowEngineServicesForTest({
      allowUnavailableEngine: true,
    });
    await expect(engine.gatewaySurface.workflows.list(ctx())).rejects.toSatisfy(
      (error: unknown) =>
        isPlatformServiceError(error) &&
        error.code === "PROVIDER_CAPABILITY_UNSUPPORTED",
    );
  });

  it("wires read-only engine ops through gateway + RequestPipeline", async () => {
    const mock = await withMockAdapter();
    try {
      const engine = createWorkflowEngineServicesForProduction({
        adapter: mock.adapter,
      });
      const workflow = createWorkflowPlatformServicesForTest({
        allowInMemoryPersistence: true,
        engine,
      });
      expect(workflow.readiness.engineEnabled).toBe(true);
      expect(workflow.readiness.engineProvider).toBe("n8n");

      const bundle = createPlatformServices({
        workflow,
        authorizationMode: "allow-all",
      });

      const request = ctx();
      const listed = await bundle.gateway.workflow.engine.workflows.list(request);
      expect(listed.length).toBeGreaterThan(0);
      expect(listed[0]?.engine).toBe("n8n");
      expect(listed[0]).not.toHaveProperty("nodes");

      const got = await bundle.gateway.workflow.engine.workflows.get(
        request,
        listed[0]!.id,
      );
      expect(got.name).toBeTruthy();

      const templates = await bundle.gateway.workflow.engine.templates.list(request);
      expect(templates.length).toBeGreaterThan(0);

      const tags = await bundle.gateway.workflow.engine.tags.list(request);
      expect(tags.some((tag) => tag.name === "ops")).toBe(true);

      const users = await bundle.gateway.workflow.engine.users.list(request);
      expect(users.length).toBeGreaterThan(0);

      const projects = await bundle.gateway.workflow.engine.projects.list(request);
      expect(projects.length).toBeGreaterThan(0);

      const capabilities =
        await bundle.gateway.workflow.engine.capabilities.get(request);
      expect(capabilities.unsupportedOperations).toContain("execute");

      const health = await bundle.gateway.workflow.engine.health.get(request);
      expect(["healthy", "degraded", "unhealthy"]).toContain(health.level);

      const diagnostics = await bundle.gateway.workflow.engine.diagnostics.get(request);
      expect(diagnostics.adapterVersion).toBeTruthy();
      expect(JSON.stringify(diagnostics)).not.toMatch(/test-key|apiKey|secret/i);

      const compatibility =
        await bundle.gateway.workflow.engine.compatibility.get(request);
      expect(compatibility.compatibilityStatus).toBe("compatible");

      const connection =
        await bundle.gateway.workflow.engine.connection.validate(request);
      expect(connection.ok).toBe(true);
    } finally {
      await mock.dispose();
    }
  });

  it("mutations return NOT_SUPPORTED PlatformServiceError", async () => {
    const mock = await withMockAdapter();
    try {
      const engine = createWorkflowEngineServicesForProduction({
        adapter: mock.adapter,
      });
      const request = ctx();
      await expect(
        engine.gatewaySurface.workflows.create(request, {}),
      ).rejects.toSatisfy(
        (error: unknown) =>
          isPlatformServiceError(error) &&
          error.code === "PROVIDER_CAPABILITY_UNSUPPORTED" &&
          /NOT_SUPPORTED|does not support/i.test(error.message),
      );
      await expect(
        engine.gatewaySurface.workflows.update(request, "1", {}),
      ).rejects.toSatisfy(
        (error: unknown) =>
          isPlatformServiceError(error) &&
          error.code === "PROVIDER_CAPABILITY_UNSUPPORTED",
      );
      await expect(
        engine.gatewaySurface.workflows.delete(request, "1"),
      ).rejects.toSatisfy(
        (error: unknown) =>
          isPlatformServiceError(error) &&
          error.code === "PROVIDER_CAPABILITY_UNSUPPORTED",
      );
      await expect(
        engine.gatewaySurface.workflows.execute(request, "1"),
      ).rejects.toSatisfy(
        (error: unknown) =>
          isPlatformServiceError(error) &&
          error.code === "PROVIDER_CAPABILITY_UNSUPPORTED",
      );
    } finally {
      await mock.dispose();
    }
  });

  it("RequestPipeline + Production Authorization denies missing engine permission", async () => {
    const resolver = new InMemoryAuthorizationAccessResolver();
    resolver.set(
      "user-engine-denied",
      AUTH_TEST_TENANT_A,
      buildActiveSnapshot({
        userId: "user-engine-denied",
        allowPermissions: ["workflow.view"],
      }),
    );
    const audit = new InMemoryAuthorizationAuditSink();
    const pipeline = new RequestPipeline({
      authorization: new ProductionAuthorizationProvider({
        accessResolver: resolver,
      }),
      policies: createDefaultProductionPolicies({ accessResolver: resolver }),
      auditSink: audit,
    });

    let invoked = false;
    await expect(
      pipeline.execute({
        service: "workflowEngineWorkflows",
        operation: "list",
        context: buildServiceContext({ userId: "user-engine-denied" }),
        args: [buildServiceContext({ userId: "user-engine-denied" })],
        invoke: async () => {
          invoked = true;
          return [];
        },
      }),
    ).rejects.toMatchObject({ code: "PERMISSION_DENIED" });
    expect(invoked).toBe(false);
    expect(audit.events.some((event) => event.decision === "deny")).toBe(true);
  });

  it("RequestPipeline + Production Authorization allows workflow.engine.read", async () => {
    const resolver = new InMemoryAuthorizationAccessResolver();
    resolver.set(
      "user-engine-reader",
      AUTH_TEST_TENANT_A,
      buildActiveSnapshot({
        userId: "user-engine-reader",
        allowPermissions: ["workflow.engine.read"],
      }),
    );
    const pipeline = new RequestPipeline({
      authorization: new ProductionAuthorizationProvider({
        accessResolver: resolver,
      }),
      policies: createDefaultProductionPolicies({ accessResolver: resolver }),
    });

    await expect(
      pipeline.execute({
        service: "workflowEngineWorkflows",
        operation: "list",
        context: buildServiceContext({ userId: "user-engine-reader" }),
        args: [buildServiceContext({ userId: "user-engine-reader" })],
        invoke: async () => [{ id: "1" }],
      }),
    ).resolves.toEqual([{ id: "1" }]);
  });

  it("production workflow factory without engineAdapter uses unavailable stubs (no mock)", () => {
    const workflow = createWorkflowPlatformServicesForTest({
      allowInMemoryPersistence: true,
    });
    expect(workflow.readiness.engineEnabled).toBe(false);
    expect(workflow.readiness.engineProvider).toBe("none");
    expect(workflow.engine.adapter).toBeNull();
  });
});
