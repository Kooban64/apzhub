import { describe, expect, it } from "vitest";

import { createQualityKnowledgeIndex } from "@apzhub/qep-knowledge-index";

import {
  BUILTIN_COMMAND_DEFINITIONS,
  QEP_COMMAND_VERSION,
  createCommandRegistry,
  createEnterpriseCommandPlatform,
  type CommandContext,
} from "./index";

function ctx(overrides: Partial<CommandContext> = {}): CommandContext {
  return {
    tenantId: "tenant-a",
    userId: "user-1",
    roles: ["member"],
    permissions: ["evidence.read", "search.read", "project.execute"],
    now: "2026-08-02T16:30:00.000Z",
    correlationId: "corr-cmd-1",
    ...overrides,
  };
}

describe("APZQEP-120-S13 Enterprise Command Platform", () => {
  it("exports version 0.1.0", () => {
    expect(QEP_COMMAND_VERSION).toBe("0.1.0");
  });

  it("registers commands deterministically without hard-coded routing", () => {
    const registry = createCommandRegistry();
    registry.registerBatch([...BUILTIN_COMMAND_DEFINITIONS].reverse());
    const ids = registry.list().map((c) => c.commandId);
    expect(ids).toEqual([...ids].sort((a, b) => a.localeCompare(b)));
    expect(ids.length).toBe(BUILTIN_COMMAND_DEFINITIONS.length);
  });

  it("executes registered handlers successfully", async () => {
    const platform = createEnterpriseCommandPlatform();
    const result = await platform.execute({
      commandId: "qep.command.system.noop",
      context: ctx(),
    });
    expect(result.outcome).toBe("success");
    expect(result.data?.ping).toBe(true);
  });

  it("enforces permission resolution on discovery and execution", async () => {
    const platform = createEnterpriseCommandPlatform();
    const denied = await platform.execute({
      commandId: "qep.command.admin.diagnostics",
      context: ctx({ roles: ["member"], permissions: [] }),
    });
    expect(denied.outcome).toBe("permission_denied");

    const allowed = await platform.execute({
      commandId: "qep.command.admin.diagnostics",
      context: ctx({
        roles: ["admin"],
        permissions: ["admin.commands"],
      }),
    });
    expect(allowed.outcome).toBe("success");
  });

  it("returns validation_error when handler validation fails", async () => {
    const platform = createEnterpriseCommandPlatform();
    const result = await platform.execute({
      commandId: "qep.command.search.knowledge",
      context: ctx(),
      args: {},
    });
    expect(result.outcome).toBe("validation_error");
    expect(result.message).toBe("validation.query_required");
  });

  it("discovers via Quality Knowledge Index only (projection-backed)", async () => {
    const qki = createQualityKnowledgeIndex();
    await qki.engine.applyEvent({
      eventType: "qep.evidence.created",
      tenantId: "tenant-a",
      payload: {
        evidenceId: "ev-cmd-1",
        title: "Safety Protocol",
        tags: ["safety"],
      },
      now: "2026-08-02T16:30:00.000Z",
    });

    const platform = createEnterpriseCommandPlatform({ knowledgeIndex: qki });
    const started = Date.now();
    const suggestions = await platform.searchCommands({
      query: "Safety",
      context: ctx(),
      limit: 20,
    });
    const elapsed = Date.now() - started;

    expect(suggestions.some((s) => s.commandId === "qep.command.evidence.open")).toBe(
      true,
    );
    expect(
      suggestions.find((s) => s.commandId === "qep.command.evidence.open")?.label,
    ).toContain("Safety Protocol");
    expect(elapsed).toBeLessThan(500);
    expect(platform.metrics.snapshot().discoveryCalls).toBe(1);
  });

  it("ranks pinned, favourite, and recent above plain matches", async () => {
    const platform = createEnterpriseCommandPlatform();
    platform.preferences.pin("user-1", "qep.command.system.noop");
    platform.preferences.favourite("user-1", "qep.command.navigate.home");
    await platform.execute({
      commandId: "qep.command.navigate.evidence",
      context: ctx(),
    });

    const ranked = await platform.searchCommands({
      query: "",
      context: ctx(),
    });
    expect(ranked[0]?.commandId).toBe("qep.command.system.noop");
    expect(ranked[0]?.source).toBe("pinned");

    const suggestions = platform.suggest(ctx());
    expect(suggestions.some((s) => s.source === "favourite")).toBe(true);
    expect(suggestions.some((s) => s.source === "recent")).toBe(true);
  });

  it("filters by category", async () => {
    const platform = createEnterpriseCommandPlatform();
    const nav = await platform.searchCommands({
      query: "",
      context: ctx(),
      category: "navigation",
    });
    expect(
      nav.every((s) => {
        const def = platform.commands.get(s.commandId);
        return def?.category === "navigation";
      }),
    ).toBe(true);
  });

  it("fails closed when handler is missing", async () => {
    const platform = createEnterpriseCommandPlatform({ registerBuiltins: false });
    platform.commands.register({
      commandId: "qep.command.orphan",
      name: "Orphan",
      description: "No handler",
      kind: "global",
      category: "system",
      keywords: [],
      requiredPermissions: [],
      requiredRoles: [],
      enabled: true,
    });
    const result = await platform.execute({
      commandId: "qep.command.orphan",
      context: ctx(),
    });
    expect(result.outcome).toBe("failure");
    expect(result.message).toBe("handler.not_registered");
    expect(platform.diagnostics().orphanCommands).toBe(1);
  });

  it("records metrics for success and failure rates", async () => {
    const platform = createEnterpriseCommandPlatform();
    await platform.execute({
      commandId: "qep.command.system.noop",
      context: ctx(),
    });
    await platform.execute({
      commandId: "qep.command.admin.diagnostics",
      context: ctx({ permissions: [] }),
    });
    const snap = platform.metrics.snapshot();
    expect(snap.commandsExecuted).toBe(2);
    expect(snap.commandsSucceeded).toBe(1);
    expect(snap.permissionFailures).toBe(1);
    expect(snap.successRate).toBe(0.5);
  });

  it("opens evidence entity from discovery context", async () => {
    const platform = createEnterpriseCommandPlatform();
    const result = await platform.execute({
      commandId: "qep.command.evidence.open",
      context: ctx({ entityKind: "evidence", entityId: "ev-9" }),
    });
    expect(result.outcome).toBe("success");
    expect(result.data?.entityId).toBe("ev-9");
  });

  it("exposes healthy diagnostics when catalogue is complete", () => {
    const platform = createEnterpriseCommandPlatform();
    const diag = platform.diagnostics();
    expect(diag.health).toBe("healthy");
    expect(diag.registeredCommands).toBe(BUILTIN_COMMAND_DEFINITIONS.length);
    expect(diag.registeredHandlers).toBe(BUILTIN_COMMAND_DEFINITIONS.length);
    expect(diag.orphanCommands).toBe(0);
  });
});
