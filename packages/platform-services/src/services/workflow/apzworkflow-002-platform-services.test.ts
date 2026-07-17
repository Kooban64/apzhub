/**
 * APZWORKFLOW-002 — Workflow Platform Services, Gateway & Authorization.
 */

import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  isPlatformServiceError,
  type ServiceRequestContext,
} from "@apzhub/platform-service-contracts";
import {
  asWorkflowConnectionId,
  PLATFORM_WORKFLOW_PERMISSIONS,
  type WorkflowGraphSnapshot,
} from "@apzhub/workflow-contracts";
import { WorkflowDomainError } from "@apzhub/workflow-core";

import {
  createPlatformServices,
  createWorkflowPlatformServicesForProduction,
  createWorkflowPlatformServicesForTest,
  mapWorkflowDomainError,
  PLATFORM_SERVICE_PERMISSION_CATALOGUE,
  PLATFORM_SERVICES_VERSION,
  resolveOperationAuthorization,
} from "../../index";

function ctx(
  overrides?: Partial<ServiceRequestContext>,
): ServiceRequestContext {
  return {
    tenantId: "tenant_wf",
    userId: "user_wf",
    organisationId: "org_wf",
    correlationId: "corr_apzworkflow_002",
    permissions: ["workflow.*"],
    ...overrides,
  };
}

function validGraph(): WorkflowGraphSnapshot {
  return {
    nodes: [
      {
        id: "n1",
        nodeKind: "trigger",
        kind: "manual",
        config: { enabled: true },
      },
      {
        id: "n2",
        nodeKind: "action",
        kind: "notify",
        label: "Notify",
        config: { channel: "email", retries: 1 },
      },
    ],
    connections: [
      {
        id: asWorkflowConnectionId("c1"),
        sourceNodeId: "n1",
        targetNodeId: "n2",
      },
    ],
  };
}

describe("APZWORKFLOW-002 workflow platform services", () => {
  it("exports platform services version 0.24.0", () => {
    expect(PLATFORM_SERVICES_VERSION).toBe("0.24.0");
  });

  it("registers workflow permissions in the platform catalogue", () => {
    for (const permission of PLATFORM_WORKFLOW_PERMISSIONS) {
      expect(PLATFORM_SERVICE_PERMISSION_CATALOGUE).toContain(permission);
    }
  });

  it("maps gateway operations to workflow permissions (no allow-all)", () => {
    expect(
      resolveOperationAuthorization("workflowWorkflows", "create")
        ?.requiredPermission,
    ).toBe("workflow.create");
    expect(
      resolveOperationAuthorization("workflowWorkflows", "get")
        ?.requiredPermission,
    ).toBe("workflow.view");
    expect(
      resolveOperationAuthorization("workflowWorkflows", "publish")
        ?.requiredPermission,
    ).toBe("workflow.publish");
    expect(
      resolveOperationAuthorization("workflowWorkflows", "archive")
        ?.requiredPermission,
    ).toBe("workflow.archive");
    expect(
      resolveOperationAuthorization("workflowWorkflows", "restore")
        ?.requiredPermission,
    ).toBe("workflow.restore");
    expect(
      resolveOperationAuthorization("workflowWorkflows", "transition")
        ?.requiredPermission,
    ).toBe("workflow.update");
    expect(
      resolveOperationAuthorization("workflowTemplates", "create")
        ?.requiredPermission,
    ).toBe("workflow.template.create");
    expect(
      resolveOperationAuthorization("workflowValidation", "validate")
        ?.requiredPermission,
    ).toBe("workflow.validation");
    expect(
      resolveOperationAuthorization("workflowAudit", "list")
        ?.requiredPermission,
    ).toBe("workflow.audit");
  });

  it("ForTest requires allowInMemoryPersistence without postgres", () => {
    expect(() => createWorkflowPlatformServicesForTest({})).toThrow(
      /allowInMemoryPersistence/,
    );
  });

  it("ForProduction throws without postgresDb", () => {
    expect(() =>
      createWorkflowPlatformServicesForProduction({
        postgresDb: undefined as never,
      }),
    ).toThrow(/postgresDb|in-memory/);
  });

  it("CRUD + lifecycle via nested gateway.workflow facets", async () => {
    let seq = 0;
    const workflow = createWorkflowPlatformServicesForTest({
      allowInMemoryPersistence: true,
      now: () => "2026-07-15T10:00:00.000Z",
      id: () => `wf002_${++seq}`,
    });
    const bundle = createPlatformServices({
      workflow,
      authorizationMode: "allow-all",
    });

    const request = ctx();
    const category = await bundle.gateway.workflow.categories.create(request, {
      name: "Ops",
    });
    const folder = await bundle.gateway.workflow.folders.create(request, {
      name: "Root",
      path: "/root",
    });

    const created = await bundle.gateway.workflow.workflows.create(request, {
      key: "approval-flow",
      name: "Approval Flow",
      categoryId: category.id,
      folderId: folder.id,
    });
    expect(created.key).toBe("approval-flow");
    expect(created.lifecycle).toBe("draft");

    const got = await bundle.gateway.workflow.workflows.get(request, created.id);
    expect(got.name).toBe("Approval Flow");

    await bundle.gateway.workflow.workflows.update(request, {
      workflowId: created.id,
      description: "Updated",
    });

    const version = await bundle.gateway.workflow.versions.create(request, {
      workflowId: created.id,
      graph: validGraph(),
      changeSummary: "initial",
    });
    expect(version.versionNumber).toBe(1);

    const listed = await bundle.gateway.workflow.versions.list(
      request,
      created.id,
    );
    expect(listed).toHaveLength(1);

    const validation = await bundle.gateway.workflow.validation.validate(
      request,
      { workflowId: created.id },
    );
    expect(validation.valid).toBe(true);

    const published = await bundle.gateway.workflow.workflows.publish(
      request,
      created.id,
    );
    expect(published.lifecycle).toBe("active");

    const archived = await bundle.gateway.workflow.workflows.archive(
      request,
      created.id,
    );
    expect(archived.lifecycle).toBe("archived");

    const restored = await bundle.gateway.workflow.workflows.restore(
      request,
      created.id,
    );
    expect(restored.lifecycle).toBe("restored");

    const found = await bundle.gateway.workflow.workflows.find(request, {
      query: "Approval",
    });
    expect(found.some((row) => row.id === created.id)).toBe(true);

    const template = await bundle.gateway.workflow.templates.create(request, {
      key: "tpl-1",
      name: "Template One",
      graph: validGraph(),
    });
    expect(template.key).toBe("tpl-1");
    const templates = await bundle.gateway.workflow.templates.list(request);
    expect(templates.length).toBeGreaterThan(0);

    const audits = await bundle.gateway.workflow.audit.list(request, created.id);
    expect(audits.length).toBeGreaterThan(0);

    expect(workflow.readiness.workflowEnabled).toBe(true);
    expect(workflow.readiness.executionEnabled).toBe(false);
    expect(workflow.readiness.persistenceMode).toBe("memory");
  });

  it("gateway.workflow throws when not configured", () => {
    const bundle = createPlatformServices({ authorizationMode: "allow-all" });
    expect(() => bundle.gateway.workflow).toThrow(/not enabled/);
  });

  it("maps WorkflowDomainError to PlatformServiceError", () => {
    const mapped = mapWorkflowDomainError(
      new WorkflowDomainError("not_found", "missing", { id: "x" }),
      "corr_map",
    );
    expect(isPlatformServiceError(mapped)).toBe(true);
    expect(mapped.category).toBe("not_found");
    expect(mapped.code).toBe("NOT_FOUND");

    const validation = mapWorkflowDomainError(
      new WorkflowDomainError("validation_error", "bad"),
      "corr_map",
    );
    expect(validation.category).toBe("validation");

    const conflict = mapWorkflowDomainError(
      new WorkflowDomainError("duplicate", "exists"),
      "corr_map",
    );
    expect(conflict.category).toBe("conflict");
  });

  it("does not import n8n / EventBus / HTTP into workflow service dirs", () => {
    const root = join(__dirname);
    for (const file of [
      "workflow-service-impls.ts",
      "create-workflow-platform-services.ts",
      "index.ts",
      "workflow-env.ts",
    ]) {
      const content = readFileSync(join(root, file), "utf8");
      expect(content).not.toMatch(/\bn8n\b|EventBus|NextRequest|OpenAPIHono|\/api\/v1/);
    }
  });

  it("surfaces not_found without leaking persistence errors", async () => {
    const workflow = createWorkflowPlatformServicesForTest({
      allowInMemoryPersistence: true,
      id: () => "wf_notfound_1",
      now: () => "2026-07-15T10:00:00.000Z",
    });
    const bundle = createPlatformServices({
      workflow,
      authorizationMode: "allow-all",
    });
    await expect(
      bundle.gateway.workflow.workflows.get(ctx(), "wf_missing_xyz" as never),
    ).rejects.toMatchObject({
      category: "not_found",
      code: "NOT_FOUND",
    });
  });
});
