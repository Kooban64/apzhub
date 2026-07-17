/**
 * APZWORKFLOW-008 — Workflow Engine HTTP handlers.
 */

import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";

import type { PlatformApiRequestContext } from "../auth/with-platform-api-auth";
import {
  resetPlatformApiGatewayBootstrap,
  setPlatformApiGatewayBootstrapForTests,
  createTestPlatformApiGatewayBootstrap,
} from "../gateway/bootstrap";
import {
  handleGetEngineCapabilities,
  handleGetEngineCompatibility,
  handleGetEngineDiagnostics,
  handleGetEngineHealth,
  handleGetEngineTemplate,
  handleGetEngineWorkflow,
  handleListEngineProjects,
  handleListEngineTags,
  handleListEngineTemplates,
  handleListEngineUsers,
  handleListEngineWorkflows,
  handleValidateEngineConnection,
} from "./workflow-engine";

function ctx(): PlatformApiRequestContext {
  return {
    tracing: {
      correlationId: "corr_eng_http",
      requestId: "req_eng_http",
    } as never,
    session: { user: { id: "user_1" } } as never,
    serviceContext: {
      tenantId: "tenant_1",
      userId: "user_1",
      organisationId: "org_1",
      correlationId: "corr_eng_http",
      permissions: ["workflow.engine.*"],
    },
  };
}

function request(url: string): NextRequest {
  return new NextRequest(url);
}

describe("APZWORKFLOW-008 workflow engine handlers", () => {
  beforeEach(() => {
    resetPlatformApiGatewayBootstrap();
  });
  afterEach(() => {
    resetPlatformApiGatewayBootstrap();
  });

  it("returns 503 envelope when workflow platform disabled", async () => {
    setPlatformApiGatewayBootstrapForTests(
      createTestPlatformApiGatewayBootstrap(
        {
          workflow: undefined,
        } as never,
        { workflowEnabled: false },
      ),
    );
    await expect(
      handleListEngineWorkflows(
        request("http://localhost/api/v1/workflows/engine/workflows"),
        ctx(),
      ),
    ).rejects.toMatchObject({
      status: 503,
      body: expect.objectContaining({ code: "WORKFLOW_SERVICE_UNAVAILABLE" }),
    });
  });

  it("delegates all read operations to gateway.workflow.engine.*", async () => {
    const engine = {
      workflows: {
        list: vi.fn(async () => [
          {
            id: "1",
            name: "Flow",
            active: false,
            tagNames: [],
            nodeCount: 1,
            connectionCount: 0,
            engine: "workflow_engine",
          },
        ]),
        get: vi.fn(async () => ({
          id: "1",
          name: "Flow",
          active: false,
          tagNames: ["ops"],
          nodeCount: 1,
          connectionCount: 0,
          engine: "workflow_engine",
        })),
      },
      templates: {
        list: vi.fn(async () => [
          {
            id: "1",
            name: "Tpl",
            tagNames: [],
            engine: "workflow_engine",
            support: "partial",
          },
        ]),
        get: vi.fn(async () => ({
          id: "1",
          name: "Tpl",
          tagNames: [],
          engine: "workflow_engine",
          support: "partial",
        })),
      },
      tags: {
        list: vi.fn(async () => [
          { id: "t1", name: "ops", engine: "workflow_engine" },
        ]),
      },
      users: {
        list: vi.fn(async () => [{ id: "u1", engine: "workflow_engine" }]),
      },
      projects: {
        list: vi.fn(async () => [
          { id: "p1", name: "Default", engine: "workflow_engine" },
        ]),
      },
      capabilities: {
        get: vi.fn(async () => ({
          services: [],
          unsupportedOperations: ["execute"],
        })),
      },
      health: {
        get: vi.fn(async () => ({
          level: "healthy",
          reasons: [],
          sdkStatus: "healthy",
        })),
      },
      diagnostics: {
        get: vi.fn(async () => ({
          adapterVersion: "0.1.0",
          healthLevel: "healthy",
          reasons: [],
          apiStatus: "reachable",
          authenticationStatus: "valid",
          authMode: "api_key",
          coreServiceCount: 1,
          compatibilityStatus: "compatible",
        })),
      },
      compatibility: {
        get: vi.fn(async () => ({
          compatibilityStatus: "compatible",
          supportedApi: "v1",
          adapterVersion: "0.1.0",
          unsupportedOperations: ["execute"],
          notes: [],
        })),
      },
      connection: {
        validate: vi.fn(async () => ({ ok: true, message: "ok" })),
      },
    };

    setPlatformApiGatewayBootstrapForTests(
      createTestPlatformApiGatewayBootstrap(
        {
          get workflow() {
            return { engine } as never;
          },
        } as never,
        { workflowEnabled: true },
      ),
    );

    const context = ctx();
    const listed = await handleListEngineWorkflows(
      request(
        "http://localhost/api/v1/workflows/engine/workflows?limit=5",
      ),
      context,
    );
    expect(listed.status).toBe(200);
    expect(engine.workflows.list).toHaveBeenCalled();

    const got = await handleGetEngineWorkflow(
      request("http://localhost/api/v1/workflows/engine/workflows/1"),
      context,
      { params: Promise.resolve({ workflowId: "1" }) },
    );
    expect(got.status).toBe(200);

    await handleListEngineTemplates(request("http://x/templates"), context);
    await handleGetEngineTemplate(request("http://x/templates/1"), context, {
      params: Promise.resolve({ templateId: "1" }),
    });
    await handleListEngineTags(request("http://x/tags"), context);
    await handleListEngineUsers(request("http://x/users"), context);
    await handleListEngineProjects(request("http://x/projects"), context);
    await handleGetEngineCapabilities(request("http://x/capabilities"), context);
    await handleGetEngineHealth(request("http://x/health"), context);
    await handleGetEngineDiagnostics(request("http://x/diagnostics"), context);
    await handleGetEngineCompatibility(
      request("http://x/compatibility"),
      context,
    );
    await handleValidateEngineConnection(request("http://x/validate"), context);

    expect(engine.connection.validate).toHaveBeenCalled();
    expect(engine.capabilities.get).toHaveBeenCalled();
  });
});
