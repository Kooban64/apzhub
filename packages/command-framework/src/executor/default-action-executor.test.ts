import { describe, expect, it, vi } from "vitest";

import { createAllowAllWorkbenchPermissionAdapter } from "@apzhub/workbench-framework";
import { createAuthWorkbenchPermissionAdapter } from "@apzhub/workbench-framework";
import type {
  WorkbenchAction,
  WorkbenchRequestResult,
} from "@apzhub/workbench-framework";
import { workbenchRequestOk } from "@apzhub/workbench-framework";

import { createDefaultActionRegistry } from "../registry";
import { createDefaultWorkbenchCommandBridge } from "../bridge";
import type { InvocationGatewayRegistry } from "../gateways";
import type { ActionAuditHook, ActionDescriptor } from "../types";
import { createDefaultActionExecutor } from "./default-action-executor";

function sampleDescriptor(
  overrides: Partial<ActionDescriptor> & Pick<ActionDescriptor, "id">,
): ActionDescriptor {
  return {
    label: "Sample",
    handler: "workbench-bridge:workbench.view.open",
    handlerKind: "workbench-bridge",
    source: "builtin",
    ...overrides,
  };
}

function createTestExecutor(options: {
  descriptors?: ActionDescriptor[];
  permissions?: readonly string[];
  bridge?: {
    toAction: (id: string, payload?: Record<string, unknown>) => WorkbenchAction | null;
  };
  workbenchExecute?: (action: WorkbenchAction) => WorkbenchRequestResult;
  auditHook?: ActionAuditHook;
  systemAllowList?: ReadonlySet<string>;
  gateways?: InvocationGatewayRegistry;
}) {
  const registry = createDefaultActionRegistry();
  for (const descriptor of options.descriptors ?? []) {
    registry.register(descriptor);
  }

  const permissionAdapter =
    options.permissions === undefined
      ? createAllowAllWorkbenchPermissionAdapter()
      : createAuthWorkbenchPermissionAdapter({
          userId: "user-1",
          permissions: options.permissions,
        });

  return createDefaultActionExecutor({
    registry,
    permissionAdapter,
    bridge: options.bridge,
    workbenchExecute: options.workbenchExecute,
    auditHook: options.auditHook,
    systemAllowList: options.systemAllowList,
    gateways: options.gateways,
  });
}

describe("DefaultActionExecutor", () => {
  it("executes workbench-bridge actions successfully", async () => {
    const bridge = createDefaultWorkbenchCommandBridge();
    const workbenchExecute = vi.fn(() => workbenchRequestOk());
    const executor = createTestExecutor({
      descriptors: [
        sampleDescriptor({
          id: "workbench.view.open",
          handler: "workbench-bridge:workbench.view.open",
        }),
      ],
      bridge,
      workbenchExecute,
    });

    const result = await executor.execute("workbench.view.open", {
      actor: "user",
      userId: "user-1",
      args: { viewId: "platform-home" },
    });

    expect(result.ok).toBe(true);
    expect(result.status).toBe("success");
    expect(result.code).toBe("SUCCESS");
    expect(result.durationMs).toBeGreaterThanOrEqual(0);
    expect(result.auditReference).toMatch(/^action-audit:/);
    expect(result.diagnostics?.phase).toBe("dispatch");
    expect(result.diagnostics?.handlerKind).toBe("workbench-bridge");
    expect(workbenchExecute).toHaveBeenCalledOnce();
  });

  it("returns NOT_FOUND for missing actions", async () => {
    const executor = createTestExecutor({});

    const result = await executor.execute("missing.action", { actor: "user" });

    expect(result.ok).toBe(false);
    expect(result.code).toBe("NOT_FOUND");
    expect(result.status).toBe("failure");
    expect(result.diagnostics?.phase).toBe("lookup");
  });

  it("returns FORBIDDEN when permission adapter denies", async () => {
    const executor = createTestExecutor({
      descriptors: [
        sampleDescriptor({
          id: "platform.admin.action",
          permission: "platform.admin.manage",
          handler: "service:admin:run",
          handlerKind: "service",
        }),
      ],
      permissions: [],
    });

    const result = await executor.execute("platform.admin.action", { actor: "user" });

    expect(result.ok).toBe(false);
    expect(result.code).toBe("FORBIDDEN");
    expect(result.diagnostics?.phase).toBe("permission");
  });

  it("invokes audit hook on every attempt", async () => {
    const record = vi.fn();
    const executor = createTestExecutor({
      auditHook: { record },
      descriptors: [
        sampleDescriptor({
          id: "platform.public.action",
          handler: "service:public:run",
          handlerKind: "service",
        }),
      ],
    });

    await executor.execute("platform.public.action", { actor: "user" });

    expect(record).toHaveBeenCalledOnce();
    expect(record.mock.calls[0]?.[0]).toMatchObject({
      actionId: "platform.public.action",
      actor: "user",
      code: "NOT_IMPLEMENTED",
      ok: false,
    });
    expect(record.mock.calls[0]?.[0].auditReference).toBeTruthy();
    expect(record.mock.calls[0]?.[0].durationMs).toBeGreaterThanOrEqual(0);
  });

  it("returns structured service handler result as NOT_IMPLEMENTED", async () => {
    const executor = createTestExecutor({
      descriptors: [
        sampleDescriptor({
          id: "service.action",
          handler: "service:theme:toggle",
          handlerKind: "service",
        }),
      ],
    });

    const result = await executor.execute("service.action", { actor: "user" });

    expect(result.code).toBe("NOT_IMPLEMENTED");
    expect(result.message).toContain("service");
  });

  it("denies system actor when action is not in allow list", async () => {
    const executor = createTestExecutor({
      descriptors: [
        sampleDescriptor({
          id: "system.job.run",
          handlerKind: "service",
          handler: "service:job:run",
        }),
      ],
      systemAllowList: new Set(),
    });

    const result = await executor.execute("system.job.run", { actor: "system" });

    expect(result.code).toBe("FORBIDDEN");
    expect(result.diagnostics?.phase).toBe("actor");
  });

  it("allows system actor for allow-listed actions", async () => {
    const executor = createTestExecutor({
      descriptors: [
        sampleDescriptor({
          id: "system.job.run",
          handler: "service:job:run",
          handlerKind: "service",
        }),
      ],
      systemAllowList: new Set(["system.job.run"]),
    });

    const result = await executor.execute("system.job.run", { actor: "system" });

    expect(result.actor).toBe("system");
    expect(result.code).toBe("NOT_IMPLEMENTED");
    expect(result.diagnostics?.phase).toBe("dispatch");
  });

  it("routes ai-agent and voice actors through invocation gateways", async () => {
    const aiExecute = vi.fn().mockReturnValue({
      ok: false,
      code: "NOT_IMPLEMENTED" as const,
      message: "ai stub",
    });
    const voiceExecute = vi.fn().mockReturnValue({
      ok: false,
      code: "NOT_IMPLEMENTED" as const,
      message: "voice stub",
    });

    const executor = createTestExecutor({
      descriptors: [sampleDescriptor({ id: "any.action" })],
      gateways: {
        ai: {
          source: "ai-agent",
          execute: aiExecute,
          proposeAndExecute: vi.fn(),
          getDiagnostics: () => ({
            source: "ai-agent",
            status: "stub",
            invocationCount: 0,
          }),
        },
        voice: {
          source: "voice",
          execute: voiceExecute,
          executeUtterance: vi.fn(),
          getDiagnostics: () => ({
            source: "voice",
            status: "stub",
            invocationCount: 0,
          }),
        },
        automation: {
          source: "automation",
          executeSystemCommand: vi.fn(),
          getDiagnostics: () => ({
            source: "automation",
            status: "stub",
            invocationCount: 0,
          }),
        },
      },
    });

    const aiResult = await executor.execute("any.action", { actor: "ai-agent" });
    const voiceResult = await executor.execute("any.action", { actor: "voice" });

    expect(aiExecute).toHaveBeenCalledOnce();
    expect(voiceExecute).toHaveBeenCalledOnce();
    expect(aiResult.code).toBe("NOT_IMPLEMENTED");
    expect(voiceResult.code).toBe("NOT_IMPLEMENTED");
    expect(aiResult.actor).toBe("ai-agent");
    expect(aiResult.diagnostics?.phase).toBe("gateway");
    expect(aiResult.diagnostics?.invocationSource).toBe("ai-agent");
  });

  it("returns NOT_IMPLEMENTED for default stub gateways", async () => {
    const executor = createTestExecutor({
      descriptors: [sampleDescriptor({ id: "any.action" })],
    });

    const aiResult = await executor.execute("any.action", { actor: "ai-agent" });
    const voiceResult = await executor.execute("any.action", { actor: "voice" });

    expect(aiResult.code).toBe("NOT_IMPLEMENTED");
    expect(voiceResult.code).toBe("NOT_IMPLEMENTED");
    expect(aiResult.diagnostics?.phase).toBe("gateway");
  });

  it("tracks execution diagnostics", async () => {
    const executor = createTestExecutor({
      descriptors: [
        sampleDescriptor({
          id: "found.action",
          handlerKind: "service",
          handler: "service:a:run",
        }),
      ],
    });

    await executor.execute("found.action", { actor: "user" });
    await executor.execute("missing.action", { actor: "user" });

    const diagnostics = executor.getDiagnostics();
    expect(diagnostics.status).toBe("ready");
    expect(diagnostics.executionCount).toBe(2);
    expect(diagnostics.notFoundCount).toBe(1);
    expect(diagnostics.lastExecutionAt).toBeTruthy();
    expect(diagnostics.gateways?.ai.status).toBe("stub");
  });
});
