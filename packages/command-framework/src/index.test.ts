import { describe, expect, it } from "vitest";

import {
  COMMAND_FRAMEWORK_STATUS,
  createActionFrameworkContext,
  createDefaultActionRegistry,
  createDefaultShortcutRegistry,
  createPlaceholderActionExecutor,
  createPlaceholderActionRegistry,
  noOpActionAuditHook,
} from "./index";

describe("@apzhub/command-framework", () => {
  it("exports registry status", () => {
    expect(COMMAND_FRAMEWORK_STATUS).toBe("hydration");
  });

  it("createActionFrameworkContext defaults to DefaultActionRegistry", () => {
    const ctx = createActionFrameworkContext();

    expect(ctx.status).toBe("hydration");
    expect(ctx.registry.getDiagnostics().status).toBe("ready");
    expect(ctx.shortcuts.getDiagnostics().status).toBe("empty");
    expect(ctx.executor.getDiagnostics().status).toBe("scaffold");
    expect(ctx.auditHook).toBe(noOpActionAuditHook);
  });

  it("allows dependency injection overrides", () => {
    const registry = createPlaceholderActionRegistry();
    const executor = createPlaceholderActionExecutor();
    const shortcuts = createDefaultShortcutRegistry();

    const ctx = createActionFrameworkContext({ registry, executor, shortcuts });

    expect(ctx.registry).toBe(registry);
    expect(ctx.executor).toBe(executor);
    expect(ctx.shortcuts).toBe(shortcuts);
  });

  it("createDefaultActionRegistry returns ready registry", () => {
    const registry = createDefaultActionRegistry();
    expect(registry.getDiagnostics().status).toBe("ready");
  });
});

describe("PlaceholderActionRegistry", () => {
  it("returns empty list and undefined get", () => {
    const registry = createPlaceholderActionRegistry();

    expect(registry.list()).toEqual([]);
    expect(registry.get("any.id")).toBeUndefined();
    expect(registry.getDiagnostics().registeredCount).toBe(0);
  });

  it("accepts register, registerMany, replace, and clear without error", () => {
    const registry = createPlaceholderActionRegistry();

    expect(() => {
      registry.register({
        id: "test.action",
        label: "Test",
        handler: "workbench-bridge:test.action",
        handlerKind: "workbench-bridge",
        source: "builtin",
      });
      registry.registerMany([]);
      registry.replace({
        id: "test.action",
        label: "Test",
        handler: "workbench-bridge:test.action",
        handlerKind: "workbench-bridge",
        source: "builtin",
      });
      registry.clear();
    }).not.toThrow();
  });
});

describe("noOpActionAuditHook", () => {
  it("record is a no-op", () => {
    expect(() =>
      noOpActionAuditHook.record({
        auditReference: "audit-1",
        actionId: "test",
        actor: "user",
        timestamp: new Date().toISOString(),
        ok: false,
        code: "SCAFFOLD",
        durationMs: 0,
      }),
    ).not.toThrow();
  });
});

describe("PlaceholderActionExecutor", () => {
  it("returns SCAFFOLD result", async () => {
    const executor = createPlaceholderActionExecutor();

    const result = await executor.execute("test.action", { actor: "user" });

    expect(result.ok).toBe(false);
    expect(result.code).toBe("SCAFFOLD");
    expect(result.actionId).toBe("test.action");
    expect(result.actor).toBe("user");
  });

  it("accepts ActionExecutionRequest shape", async () => {
    const executor = createPlaceholderActionExecutor();

    const result = await executor.execute({
      actionId: "test.action",
      context: { actor: "system" },
    });

    expect(result.actor).toBe("system");
    expect(result.code).toBe("SCAFFOLD");
  });
});
