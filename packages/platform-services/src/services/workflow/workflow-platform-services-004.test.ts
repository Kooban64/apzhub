/**
 * APZHUB-PLATFORM-WORKFLOW-004 — Workflow Platform Services runtime plane.
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
import { asWorkflowId } from "@apzhub/workflow-contracts";

import {
  createWorkflowEngineServicesForTest,
  createWorkflowPlatformServicesForTest,
  resolveOperationAuthorization,
} from "../../index";
import { createInMemoryWorkflowRuntimeRegistry } from "./in-memory-workflow-runtime-registry";
import {
  createMockWorkflowOpsProvider,
  createN8nWorkflowOpsProvider,
} from "./n8n-ops-provider";
import { WorkflowRunServiceImpl } from "./workflow-runtime-service-impls";

function ctx(permissions: readonly string[] = ["workflow.*"]): ServiceRequestContext {
  return {
    tenantId: "tenant_wf004",
    userId: "user_wf004",
    organisationId: "org_wf004",
    correlationId: "corr_wf004",
    permissions: [...permissions],
  };
}

describe("APZHUB-PLATFORM-WORKFLOW-004 platform services", () => {
  it("exposes runtime facets on gateway.workflow", () => {
    const bundle = createWorkflowPlatformServicesForTest({
      allowInMemoryPersistence: true,
    });
    const g = bundle.gatewaySurface;
    expect(g.runs).toBeDefined();
    expect(g.schedules).toBeDefined();
    expect(g.tasks).toBeDefined();
    expect(g.approvals).toBeDefined();
    expect(g.notifications).toBeDefined();
    expect(g.capabilities).toBeDefined();
    expect(g.health).toBeDefined();
    expect(bundle.readiness.runtimePlaneEnabled).toBe(true);
    expect(bundle.readiness.executionEnabled).toBe(false);
    expect(bundle.runtime.runs).toBeInstanceOf(WorkflowRunServiceImpl);
  });

  it("starts a run and records PROVIDER_EXECUTE_NOT_SUPPORTED when ops deny execute", async () => {
    const bundle = createWorkflowPlatformServicesForTest({
      allowInMemoryPersistence: true,
      providerExecuteSupported: false,
    });
    const run = await bundle.gatewaySurface.runs.start(ctx(), {
      workflowId: asWorkflowId("wf_demo"),
      input: { values: { a: 1 } },
    });
    expect(run.status).toBe("failed");
    expect(run.error?.code).toBe("PROVIDER_EXECUTE_NOT_SUPPORTED");
    const listed = await bundle.gatewaySurface.runs.list(ctx(), {
      workflowId: asWorkflowId("wf_demo"),
    });
    expect(listed).toHaveLength(1);
  });

  it("starts a running run when mock provider execute is enabled", async () => {
    const bundle = createWorkflowPlatformServicesForTest({
      allowInMemoryPersistence: true,
      ops: createMockWorkflowOpsProvider({ providerExecuteSupported: true }),
    });
    const run = await bundle.gatewaySurface.runs.start(ctx(), {
      workflowId: asWorkflowId("wf_exec"),
    });
    expect(run.status).toBe("running");
    expect(run.provider?.providerRef).toMatch(/^mock_run_/);
    const cancelled = await bundle.gatewaySurface.runs.cancel(ctx(), run.id, "stop");
    expect(cancelled.status).toBe("cancelled");
  });

  it("manages schedules and HITL approvals with permission enforcement", async () => {
    const bundle = createWorkflowPlatformServicesForTest({
      allowInMemoryPersistence: true,
      ops: createMockWorkflowOpsProvider({ providerExecuteSupported: true }),
    });
    const schedule = await bundle.gatewaySurface.schedules.create(ctx(), {
      workflowId: asWorkflowId("wf_sched"),
      cron: "0 * * * *",
      timezone: "UTC",
    });
    expect(schedule.status).toBe("draft");
    const armed = await bundle.gatewaySurface.schedules.arm(ctx(), schedule.id);
    expect(armed.status).toBe("armed");

    const run = await bundle.gatewaySurface.runs.start(ctx(), {
      workflowId: asWorkflowId("wf_sched"),
    });
    const task = await bundle.runtime.tasks.seedTask(ctx(), {
      runId: run.id,
      kind: "approval",
      title: "Approve",
    });
    const approved = await bundle.gatewaySurface.approvals.approve(ctx(), {
      taskId: task.id,
    });
    expect(approved.status).toBe("approved");
    expect(approved.decision).toBe("approved");

    await expect(
      bundle.gatewaySurface.schedules.create(ctx(["workflow.view"]), {
        workflowId: asWorkflowId("wf_sched"),
        cron: "0 1 * * *",
      }),
    ).rejects.toSatisfy((err: unknown) => isPlatformServiceError(err));
  });

  it("publishes notification intents and lists capabilities/health", async () => {
    const bundle = createWorkflowPlatformServicesForTest({
      allowInMemoryPersistence: true,
    });
    const intent = await bundle.gatewaySurface.notifications.publishIntent(ctx(), {
      templateKey: "workflow.run.failed",
      payload: { reason: "test" },
    });
    expect(intent.templateKey).toBe("workflow.run.failed");
    const fetched = await bundle.gatewaySurface.notifications.getIntent(
      ctx(),
      intent.id,
    );
    expect(fetched.id).toBe(intent.id);

    const caps = await bundle.gatewaySurface.capabilities.listCapabilities(ctx());
    expect(caps.some((c) => c.key.includes("execute"))).toBe(true);
    const health = await bundle.gatewaySurface.health.getHealth(ctx());
    expect(health.status).toBe("healthy");
    expect(health.providerId).toBe("workflow-mock");
  });

  it("maps runtime operations in the authorization catalogue", () => {
    expect(
      resolveOperationAuthorization("workflowRuns", "start")?.requiredPermission,
    ).toBe("workflow.runs.start");
    expect(
      resolveOperationAuthorization("workflowRuns", "cancel")?.requiredPermission,
    ).toBe("workflow.runs.cancel");
    expect(
      resolveOperationAuthorization("workflowSchedules", "arm")?.requiredPermission,
    ).toBe("workflow.schedules.manage");
    expect(
      resolveOperationAuthorization("workflowApprovals", "approve")?.requiredPermission,
    ).toBe("workflow.tasks.approve");
    expect(
      resolveOperationAuthorization("workflowHealth", "getHealth")?.requiredPermission,
    ).toBe("workflow.engine.health");
  });

  it("integrates n8n adapter ops without leaking provider DTOs", async () => {
    const result = await createN8nAdapter({
      tenantId: "tenant_wf004",
      n8n: DEFAULT_TEST_N8N_CONFIG,
      apiKey: "test-key",
      adapterOptions: { fetchFn: createMockN8nFetch() },
    });
    try {
      const engine = createWorkflowEngineServicesForTest({
        adapter: result.adapter,
      });
      const bundle = createWorkflowPlatformServicesForTest({
        allowInMemoryPersistence: true,
        engine,
        ops: createN8nWorkflowOpsProvider(result.adapter),
      });
      expect(bundle.readiness.opsProviderId).toBe("n8n");
      expect(bundle.readiness.providerExecuteSupported).toBe(false);
      const providers = await bundle.gatewaySurface.capabilities.listProviders(ctx());
      expect(providers[0]?.key).toBe("n8n");
      const blob = JSON.stringify(providers);
      expect(blob.toLowerCase()).not.toMatch(/x-n8n-api-key|\/rest\/workflows/);
      const run = await bundle.gatewaySurface.runs.start(ctx(), {
        workflowId: asWorkflowId("wf_n8n"),
      });
      expect(run.error?.code).toBe("PROVIDER_EXECUTE_NOT_SUPPORTED");
    } finally {
      await disposeN8nAdapter(result.adapter, result.factory);
    }
  });

  it("uses an injectable runtime registry", async () => {
    const registry = createInMemoryWorkflowRuntimeRegistry();
    const bundle = createWorkflowPlatformServicesForTest({
      allowInMemoryPersistence: true,
      runtimeRegistry: registry,
      providerExecuteSupported: true,
    });
    const requestCtx = ctx();
    const run = await bundle.gatewaySurface.runs.start(requestCtx, {
      workflowId: asWorkflowId("wf_reg"),
    });
    const again = await registry.getRun(requestCtx, run.id);
    expect(again?.id).toBe(run.id);
  });
});
