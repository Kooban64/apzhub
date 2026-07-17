/**
 * APZWORKFLOW-002 — scoped coverage for services/workflow/**
 */

import { describe, expect, it, vi } from "vitest";

import type { ServiceRequestContext } from "@apzhub/platform-service-contracts";
import { isPlatformServiceError } from "@apzhub/platform-service-contracts";
import {
  asWorkflowConnectionId,
  type WorkflowGraphSnapshot,
} from "@apzhub/workflow-contracts";
import {
  createWorkflowFoundation,
  WorkflowDomainError,
} from "@apzhub/workflow-core";
import {
  createEmptyWorkflowInMemoryStores,
  createInMemoryWorkflowRepositories,
  createWorkflowPersistenceForTest,
} from "@apzhub/workflow-persistence";

import { createPlatformServices } from "../../index";
import {
  createWorkflowPlatformServices,
  createWorkflowPlatformServicesForProduction,
  createWorkflowPlatformServicesForTest,
  wrapWorkflowPlatformGatewayWithPipeline,
} from "./create-workflow-platform-services";
import { isWorkflowServiceEnabled } from "./workflow-env";
import {
  createWorkflowPlatformServiceImpls,
  mapWorkflowDomainError,
} from "./workflow-service-impls";
import { createPlatformWorkflowService } from "@apzhub/workflow-core";

function ctx(
  overrides?: Partial<ServiceRequestContext>,
): ServiceRequestContext {
  return {
    tenantId: "tenant_cov",
    userId: "user_cov",
    organisationId: "org_cov",
    correlationId: "corr_cov",
    permissions: ["workflow.*"],
    ...overrides,
  };
}

function graph(): WorkflowGraphSnapshot {
  return {
    nodes: [
      {
        id: "t1",
        nodeKind: "trigger",
        kind: "manual",
        config: { enabled: true },
      },
      {
        id: "a1",
        nodeKind: "action",
        kind: "task",
        config: { retries: 0 },
      },
    ],
    connections: [
      {
        id: asWorkflowConnectionId("c_cov_1"),
        sourceNodeId: "t1",
        targetNodeId: "a1",
      },
    ],
  };
}

describe("APZWORKFLOW-002 coverage", () => {
  it("evaluates isWorkflowServiceEnabled from env", () => {
    expect(isWorkflowServiceEnabled({ APZHUB_WORKFLOW_ENABLED: "true" })).toBe(
      true,
    );
    expect(isWorkflowServiceEnabled({ APZHUB_WORKFLOW_ENABLED: "1" })).toBe(
      true,
    );
    expect(isWorkflowServiceEnabled({ APZHUB_WORKFLOW_ENABLED: "on" })).toBe(
      true,
    );
    expect(isWorkflowServiceEnabled({ APZHUB_WORKFLOW_ENABLED: "false" })).toBe(
      false,
    );
    expect(isWorkflowServiceEnabled({ APZHUB_WORKFLOW_ENABLED: "0" })).toBe(
      false,
    );
    expect(isWorkflowServiceEnabled({ APZHUB_WORKFLOW_ENABLED: "off" })).toBe(
      false,
    );
    expect(isWorkflowServiceEnabled({})).toBe(false);
  });

  it("maps every WorkflowDomainError classification", () => {
    const cases: [string, string][] = [
      ["validation_error", "validation"],
      ["reference_error", "validation"],
      ["missing_repos", "validation"],
      ["missing_repository", "validation"],
      ["not_found", "not_found"],
      ["duplicate", "conflict"],
      ["conflict", "conflict"],
      ["invalid_lifecycle_transition", "business_rule"],
      ["forbidden", "authorization"],
      ["other_code", "business_rule"],
    ];
    for (const [code, category] of cases) {
      const mapped = mapWorkflowDomainError(
        new WorkflowDomainError(code, code),
        "c",
      );
      expect(mapped.category).toBe(category);
    }
  });

  it("masks postgres-like errors and rethrows PlatformServiceError", async () => {
    const stores = createEmptyWorkflowInMemoryStores();
    const repos = createInMemoryWorkflowRepositories(stores);
    const domain = createPlatformWorkflowService({
      repos,
      now: () => "2026-07-15T00:00:00.000Z",
      id: () => "id_cov_1",
    });
    const impls = createWorkflowPlatformServiceImpls({ domain });
    const original = domain.getWorkflow.bind(domain);
    domain.getWorkflow = async () => {
      throw new Error('relation "platform_workflow" does not exist');
    };
    await expect(
      impls.workflows.get(ctx(), "wf_x" as never),
    ).rejects.toMatchObject({
      category: "integration",
      code: "PROVIDER_UNAVAILABLE",
    });
    domain.getWorkflow = async () => {
      throw Object.assign(new Error("boom"), { name: "Weird" });
    };
    await expect(
      impls.workflows.get(ctx(), "wf_y" as never),
    ).rejects.toMatchObject({
      category: "system",
      code: "INTERNAL_ERROR",
    });
    domain.getWorkflow = async () => {
      throw mapWorkflowDomainError(
        new WorkflowDomainError("not_found", "gone"),
        "c",
      );
    };
    await expect(
      impls.workflows.get(ctx(), "wf_z" as never),
    ).rejects.toSatisfy(isPlatformServiceError);
    domain.getWorkflow = original;
  });

  it("createWorkflowPlatformServices from persistence and foundation", async () => {
    const persistence = createWorkflowPersistenceForTest({
      allowInMemoryPersistence: true,
    });
    const foundation = createWorkflowFoundation({ repos: persistence });
    const withFoundation = createWorkflowPlatformServices({
      foundation,
      persistence,
      persistenceMode: "memory",
    });
    expect(withFoundation.readiness.workflowEnabled).toBe(true);
    expect(withFoundation.foundation).toBe(foundation);
    // Exercise default now/id factories via real create.
    await withFoundation.gatewaySurface.workflows.create(ctx(), {
      key: `k_${Date.now()}`,
      name: "Default clocks",
    });

    const plain = createWorkflowPlatformServices({
      persistence,
    });
    expect(plain.readiness.persistenceMode).toBe("memory");
    await plain.gatewaySurface.folders.create(ctx(), {
      name: "F",
      path: "/f2",
    });

    const services = createPlatformServices({
      workflow: plain,
      authorizationMode: "allow-all",
    });
    // wrapWithPipeline on bundle + each facet wrapServiceWithPipeline
    expect(services.gateway.workflow.workflows).toBeTruthy();
    expect(services.gateway.workflow.versions).toBeTruthy();
    expect(services.gateway.workflow.templates).toBeTruthy();
    expect(services.gateway.workflow.categories).toBeTruthy();
    expect(services.gateway.workflow.folders).toBeTruthy();
    expect(services.gateway.workflow.validation).toBeTruthy();
    expect(services.gateway.workflow.audit).toBeTruthy();

    const wrapped = wrapWorkflowPlatformGatewayWithPipeline(
      plain.gatewaySurface,
      services.pipeline,
    );
    expect(wrapped.workflows).toBeTruthy();
    expect(wrapped.validation).toBeTruthy();
    expect(withFoundation.wrapWithPipeline(services.pipeline).audit).toBeTruthy();
  });

  it("ForProduction with postgresDb stub builds postgres readiness", () => {
    const fakeDb = { execute: vi.fn() } as never;
    const bundle = createWorkflowPlatformServicesForProduction({
      postgresDb: fakeDb,
      now: () => "2026-07-15T00:00:00.000Z",
      id: () => "prod_1",
    });
    expect(bundle.readiness.persistenceMode).toBe("postgres");
    expect(bundle.readiness.executionEnabled).toBe(false);
  });

  it("exercises remaining gateway facets and error paths", async () => {
    let seq = 0;
    const workflow = createWorkflowPlatformServicesForTest({
      allowInMemoryPersistence: true,
      now: () => "2026-07-15T10:00:00.000Z",
      id: () => `cov_${++seq}`,
    });
    const bundle = createPlatformServices({
      workflow,
      authorizationMode: "allow-all",
    });
    const request = ctx();

    const created = await bundle.gateway.workflow.workflows.create(request, {
      key: "cov-flow",
      name: "Cov Flow",
      description: "d",
    });
    await bundle.gateway.workflow.workflows.transition(request, {
      workflowId: created.id,
      to: "inactive",
    });

    const version = await bundle.gateway.workflow.versions.create(request, {
      workflowId: created.id,
      graph: graph(),
    });
    const gotVersion = await bundle.gateway.workflow.versions.get(
      request,
      version.id,
    );
    expect(gotVersion.id).toBe(version.id);

    const template = await bundle.gateway.workflow.templates.create(request, {
      key: "tpl-cov",
      name: "Tpl",
      graph: graph(),
    });
    await bundle.gateway.workflow.templates.update(request, {
      templateId: template.id,
      name: "Tpl2",
      categoryId: null,
    });
    expect(
      (await bundle.gateway.workflow.templates.get(request, template.id)).name,
    ).toBe("Tpl2");
    await bundle.gateway.workflow.templates.delete(request, template.id);

    const category = await bundle.gateway.workflow.categories.create(request, {
      name: "Cat",
    });
    expect(
      await bundle.gateway.workflow.categories.get(request, category.id),
    ).toBeTruthy();
    expect(
      (await bundle.gateway.workflow.categories.list(request)).length,
    ).toBeGreaterThan(0);

    const folder = await bundle.gateway.workflow.folders.create(request, {
      name: "Fold",
      path: "/f",
    });
    expect(
      await bundle.gateway.workflow.folders.get(request, folder.id),
    ).toBeTruthy();
    expect(
      (await bundle.gateway.workflow.folders.list(request)).length,
    ).toBeGreaterThan(0);

    await expect(
      bundle.gateway.workflow.workflows.create(request, {
        key: "",
        name: "x",
      }),
    ).rejects.toMatchObject({ category: "validation" });

    await expect(
      bundle.gateway.workflow.workflows.update(request, {
        workflowId: created.id,
        name: "ok",
      }),
    ).resolves.toBeTruthy();

    await bundle.gateway.workflow.workflows.delete(request, created.id);
  });
});
