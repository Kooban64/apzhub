import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import { PLATFORM_ACTION_CATALOGUE } from "../catalogue";
import { ACTION_FRAMEWORK_PLATFORM_VERSION } from "../catalogue/platform-version";
import type { ActionRegistryDto } from "../server/map-action-registry-dto";
import { CommandRegistryProvider } from "./command-registry-context";
import { useCommandRegistry } from "./use-command-registry";

function sampleDto(): ActionRegistryDto {
  return {
    actions: [
      {
        id: "platform.theme.toggle",
        label: "Toggle Theme",
        handler: "service:theme-service:toggle",
        handlerKind: "service",
        source: "manifest",
        palette: true,
      },
      ...PLATFORM_ACTION_CATALOGUE.map((entry) => ({
        id: entry.id,
        label: entry.label,
        handler: `workbench-bridge:${entry.id}`,
        handlerKind: "workbench-bridge" as const,
        source: "builtin" as const,
        version: ACTION_FRAMEWORK_PLATFORM_VERSION,
        palette: entry.palette,
      })),
    ],
    toolbar: [],
  };
}

function createWrapper(dto: ActionRegistryDto = sampleDto()) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <CommandRegistryProvider dto={dto}>{children}</CommandRegistryProvider>;
  };
}

describe("useCommandRegistry", () => {
  it("returns isReady and hydrated commands after provider mount", async () => {
    const { result } = renderHook(() => useCommandRegistry(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isReady).toBe(true);
    });

    expect(result.current.commands.length).toBe(1 + PLATFORM_ACTION_CATALOGUE.length);
    expect(result.current.diagnostics.status).toBe("hydrated");
    expect(result.current.diagnostics.synchronisation.mode).toBe("hydration");
  });

  it("list({ query }) filters by label substring", async () => {
    const { result } = renderHook(() => useCommandRegistry(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isReady).toBe(true);
    });

    const matches = result.current.list({ query: "theme" });
    expect(matches).toHaveLength(1);
    expect(matches[0]?.label).toBe("Toggle Theme");
  });

  it("returns toolbar regions from hydrated dto", async () => {
    const dto: ActionRegistryDto = {
      ...sampleDto(),
      toolbar: [
        { region: "workspace", items: [{ commandId: "platform.theme.toggle" }] },
      ],
    };
    const { result } = renderHook(() => useCommandRegistry(), {
      wrapper: createWrapper(dto),
    });

    await waitFor(() => {
      expect(result.current.isReady).toBe(true);
    });

    expect(result.current.toolbar).toHaveLength(1);
    expect(result.current.toolbar[0]?.region).toBe("workspace");
  });

  it("get resolves action descriptors by id", async () => {
    const { result } = renderHook(() => useCommandRegistry(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isReady).toBe(true);
    });

    expect(result.current.get("platform.theme.toggle")?.label).toBe("Toggle Theme");
    expect(result.current.get("missing.action")).toBeUndefined();
  });

  it("execute delegates to injected executor with actor user", async () => {
    const execute = vi.fn().mockResolvedValue({
      ok: true,
      code: "SUCCESS",
      actionId: "platform.theme.toggle",
      actor: "user",
      durationMs: 1,
    });
    const executor = {
      execute,
      executeSync: vi.fn(),
      getDiagnostics: () => ({ status: "ready" as const, executionCount: 0 }),
    };

    function Wrapper({ children }: { children: ReactNode }) {
      return (
        <CommandRegistryProvider dto={sampleDto()} executor={executor}>
          {children}
        </CommandRegistryProvider>
      );
    }

    const { result } = renderHook(() => useCommandRegistry(), { wrapper: Wrapper });

    await waitFor(() => {
      expect(result.current.isReady).toBe(true);
    });

    await result.current.execute("platform.theme.toggle", { mode: "dark" });

    expect(execute).toHaveBeenCalledWith("platform.theme.toggle", {
      actor: "user",
      args: { mode: "dark" },
    });
  });

  it("throws when used outside provider", () => {
    expect(() => renderHook(() => useCommandRegistry())).toThrow(
      "useCommandRegistry must be used within CommandRegistryProvider",
    );
  });

  it("reports not-ready for invalid DTO", async () => {
    const { result } = renderHook(() => useCommandRegistry(), {
      wrapper: createWrapper({
        actions: "invalid" as unknown as ActionRegistryDto["actions"],
        toolbar: [],
      }),
    });

    await waitFor(() => {
      expect(result.current.isReady).toBe(false);
    });

    expect(result.current.commands).toHaveLength(0);
    expect(result.current.diagnostics.status).toBe("invalid");
  });

  it("placeholder executor works when none injected", async () => {
    const { result } = renderHook(() => useCommandRegistry(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isReady).toBe(true);
    });

    const execution = await result.current.execute("platform.theme.toggle");
    expect(execution.code).toBe("SCAFFOLD");
    expect(execution.actor).toBe("user");
  });

  it("exposes shortcut registry hydration from context", async () => {
    const dto: ActionRegistryDto = {
      actions: [
        {
          id: "platform.theme.toggle",
          label: "Toggle Theme",
          handler: "service:theme-service:toggle",
          handlerKind: "service",
          source: "manifest",
          shortcut: "Ctrl+Shift+T",
        },
      ],
      toolbar: [],
    };

    const { result } = renderHook(() => useCommandRegistry(), {
      wrapper: createWrapper(dto),
    });

    await waitFor(() => {
      expect(result.current.shortcutDiagnostics.registrationCount).toBe(1);
    });

    expect(result.current.shortcuts.lookup("Ctrl+Shift+T")).toBe(
      "platform.theme.toggle",
    );
    expect(result.current.shortcutConflicts).toEqual([]);
  });
});

describe("useActionRegistry alias", () => {
  it("re-exports useCommandRegistry", async () => {
    const { useActionRegistry } = await import("./index");

    const { result } = renderHook(() => useActionRegistry(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isReady).toBe(true);
    });
  });
});
