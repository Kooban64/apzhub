/**
 * APZWORKFLOW-007 — scoped coverage for workflow engine Platform Services façade.
 */

import { describe, expect, it } from "vitest";

import {
  createN8nAdapter,
  createMockN8nFetch,
  DEFAULT_TEST_N8N_CONFIG,
  disposeN8nAdapter,
  N8nNotSupportedError,
} from "@apzhub/integration-n8n";
import {
  isPlatformServiceError,
  PlatformServiceError,
  type ServiceRequestContext,
} from "@apzhub/platform-service-contracts";

import { RequestPipeline } from "../../execution/request-pipeline";
import {
  createWorkflowEngineServicesForProduction,
  createWorkflowEngineServicesForTest,
  wrapWorkflowEngineGatewayWithPipeline,
} from "./create-workflow-engine-services";
import { createUnavailableWorkflowEngineServices } from "./unavailable-workflow-engine-services";
import {
  createWorkflowEngineServiceImpls,
  mapEngineError,
} from "./workflow-engine-service-impls";

function ctx(
  overrides?: Partial<ServiceRequestContext>,
): ServiceRequestContext {
  return {
    tenantId: "tenant_eng_cov",
    userId: "user_eng_cov",
    organisationId: "org_eng_cov",
    correlationId: "corr_eng_cov",
    permissions: ["workflow.engine.*"],
    ...overrides,
  };
}

async function withMockAdapter() {
  const result = await createN8nAdapter({
    tenantId: "tenant_eng_cov",
    n8n: DEFAULT_TEST_N8N_CONFIG,
    apiKey: "cov-key",
    adapterOptions: { fetchFn: createMockN8nFetch() },
  });
  return {
    adapter: result.adapter,
    async dispose() {
      await disposeN8nAdapter(result.adapter, result.factory);
    },
  };
}

describe("APZWORKFLOW-007 coverage", () => {
  it("mapEngineError translates N8nNotSupportedError and rethrows PlatformServiceError", () => {
    const existing = new PlatformServiceError({
      category: "validation",
      code: "VALIDATION_FAILED",
      message: "x",
      correlationId: "c1",
      retryable: false,
    });
    expect(() => mapEngineError(existing, "c1")).toThrow(existing);

    expect(() =>
      mapEngineError(new N8nNotSupportedError("workflows.create"), "c2"),
    ).toThrow(
      expect.objectContaining({
        code: "PROVIDER_CAPABILITY_UNSUPPORTED",
      }),
    );

    expect(() => mapEngineError(new Error("boom"), "c3")).toThrow(
      expect.objectContaining({
        code: "INTERNAL_ERROR",
      }),
    );
  });

  it("createUnavailableWorkflowEngineServices covers all facets", async () => {
    const gateway = createUnavailableWorkflowEngineServices();
    const request = ctx();
    await expect(gateway.workflows.list(request)).rejects.toSatisfy(
      isPlatformServiceError,
    );
    await expect(gateway.workflows.get(request, "1")).rejects.toSatisfy(
      isPlatformServiceError,
    );
    await expect(gateway.workflows.create(request, {})).rejects.toSatisfy(
      isPlatformServiceError,
    );
    await expect(gateway.workflows.update(request, "1", {})).rejects.toSatisfy(
      isPlatformServiceError,
    );
    await expect(gateway.workflows.delete(request, "1")).rejects.toSatisfy(
      isPlatformServiceError,
    );
    await expect(gateway.workflows.execute(request, "1")).rejects.toSatisfy(
      isPlatformServiceError,
    );
    await expect(gateway.templates.list(request)).rejects.toSatisfy(
      isPlatformServiceError,
    );
    await expect(gateway.templates.get(request, "tpl")).rejects.toSatisfy(
      isPlatformServiceError,
    );
    await expect(gateway.tags.list(request)).rejects.toSatisfy(
      isPlatformServiceError,
    );
    await expect(gateway.tags.get(request, "t1")).rejects.toSatisfy(
      isPlatformServiceError,
    );
    await expect(gateway.users.list(request)).rejects.toSatisfy(
      isPlatformServiceError,
    );
    await expect(gateway.users.get(request, "u1")).rejects.toSatisfy(
      isPlatformServiceError,
    );
    await expect(gateway.projects.list(request)).rejects.toSatisfy(
      isPlatformServiceError,
    );
    await expect(gateway.projects.get(request, "p1")).rejects.toSatisfy(
      isPlatformServiceError,
    );
    await expect(gateway.capabilities.get(request)).rejects.toSatisfy(
      isPlatformServiceError,
    );
    await expect(gateway.health.get(request)).rejects.toSatisfy(
      isPlatformServiceError,
    );
    await expect(gateway.diagnostics.get(request)).rejects.toSatisfy(
      isPlatformServiceError,
    );
    await expect(gateway.compatibility.get(request)).rejects.toSatisfy(
      isPlatformServiceError,
    );
    await expect(gateway.connection.validate(request)).rejects.toSatisfy(
      isPlatformServiceError,
    );

    const unavailableBundle = createWorkflowEngineServicesForTest({
      allowUnavailableEngine: true,
    });
    const pipeline = new RequestPipeline({
      authorization: {
        async authorize() {
          return { decision: "allow", reason: "test" };
        },
      } as never,
    });
    await expect(
      unavailableBundle.wrapWithPipeline(pipeline).workflows.list(request),
    ).rejects.toSatisfy(isPlatformServiceError);
  });

  it("wraps engine gateway with pipeline service names", async () => {
    const mock = await withMockAdapter();
    try {
      const bundle = createWorkflowEngineServicesForProduction({
        adapter: mock.adapter,
      });
      const pipeline = new RequestPipeline({
        authorization: {
          async authorize() {
            return { decision: "allow", reason: "test" };
          },
        } as never,
      });
      const wrapped = wrapWorkflowEngineGatewayWithPipeline(
        bundle.gatewaySurface,
        pipeline,
      );
      const listed = await wrapped.workflows.list(ctx());
      expect(listed.length).toBeGreaterThan(0);

      const fromFactory = createWorkflowEngineServiceImpls({
        adapter: mock.adapter,
      });
      expect(fromFactory.workflows).toBeDefined();

      const testBundle = createWorkflowEngineServicesForTest({
        adapter: mock.adapter,
      });
      expect(testBundle.readiness.engineEnabled).toBe(true);
      expect(testBundle.wrapWithPipeline(pipeline).templates).toBeDefined();
    } finally {
      await mock.dispose();
    }
  });

  it("covers getTag / getTemplate / getUser / getProject happy paths", async () => {
    const mock = await withMockAdapter();
    try {
      const gateway = createWorkflowEngineServiceImpls({
        adapter: mock.adapter,
      });
      const request = ctx();
      const tags = await gateway.tags.list(request);
      const tag = await gateway.tags.get(request, tags[0]!.id);
      expect(tag.id).toBe(tags[0]!.id);

      const templates = await gateway.templates.list(request);
      const template = await gateway.templates.get(request, templates[0]!.id);
      expect(template.id).toBe(templates[0]!.id);

      const users = await gateway.users.list(request);
      const user = await gateway.users.get(request, users[0]!.id);
      expect(user.id).toBe(users[0]!.id);

      const projects = await gateway.projects.list(request);
      const project = await gateway.projects.get(request, projects[0]!.id);
      expect(project.id).toBe(projects[0]!.id);
    } finally {
      await mock.dispose();
    }
  });
});
