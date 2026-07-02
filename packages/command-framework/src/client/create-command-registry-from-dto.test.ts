import { describe, expect, it } from "vitest";

import { PLATFORM_ACTION_CATALOGUE } from "../catalogue";
import { ACTION_FRAMEWORK_PLATFORM_VERSION } from "../catalogue/platform-version";
import type { ActionRegistryDto } from "../server/map-action-registry-dto";
import {
  ClientActionRegistry,
  createEmptyClientActionRegistry,
} from "./client-action-registry";
import { createCommandRegistryFromDto } from "./create-command-registry-from-dto";
import { validateActionRegistryDto } from "./validate-action-registry-dto";

function sampleDto(overrides: Partial<ActionRegistryDto> = {}): ActionRegistryDto {
  return {
    actions: [
      {
        id: "platform.theme.toggle",
        label: "Toggle Theme",
        handler: "service:theme-service:toggle",
        handlerKind: "service",
        source: "manifest",
        capabilityId: "default-theme",
        version: "1.0.0",
        palette: true,
        order: 10,
        group: "appearance",
      },
      ...PLATFORM_ACTION_CATALOGUE.map((entry) => ({
        id: entry.id,
        label: entry.label,
        handler: `workbench-bridge:${entry.id}`,
        handlerKind: "workbench-bridge" as const,
        source: "builtin" as const,
        version: ACTION_FRAMEWORK_PLATFORM_VERSION,
        palette: entry.palette,
        order: entry.order,
        group: entry.group,
      })),
    ],
    toolbar: [],
    ...overrides,
  };
}

describe("validateActionRegistryDto", () => {
  it("rejects non-object payloads", () => {
    const result = validateActionRegistryDto(null);
    expect(result.ok).toBe(false);
    expect(result.errors[0]?.message).toContain("object");
  });

  it("rejects missing actions array", () => {
    const result = validateActionRegistryDto({ toolbar: [] });
    expect(result.ok).toBe(false);
    expect(result.errors[0]?.field).toBe("actions");
  });

  it("rejects invalid descriptors", () => {
    const result = validateActionRegistryDto({
      actions: [
        {
          id: "bad id",
          label: "Bad",
          handler: "service:a:run",
          handlerKind: "service",
          source: "manifest",
        },
      ],
      toolbar: [],
    });
    expect(result.ok).toBe(false);
    expect(result.errors[0]?.code).toBe("VALIDATION");
  });

  it("rejects duplicate action ids", () => {
    const result = validateActionRegistryDto({
      actions: [
        {
          id: "dup.action",
          label: "One",
          handler: "service:one:run",
          handlerKind: "service",
          source: "manifest",
        },
        {
          id: "dup.action",
          label: "Two",
          handler: "service:two:run",
          handlerKind: "service",
          source: "manifest",
        },
      ],
      toolbar: [],
    });
    expect(result.ok).toBe(false);
    expect(result.errors[0]?.code).toBe("DUPLICATE_ID");
  });
});

describe("createCommandRegistryFromDto", () => {
  it("hydrates a read-only registry from a valid DTO", () => {
    const dto = sampleDto();
    const result = createCommandRegistryFromDto(dto);

    expect(result.ok).toBe(true);
    expect(result.registry.has("platform.theme.toggle")).toBe(true);
    expect(result.registry.has("workbench.view.open")).toBe(true);
    expect(result.diagnostics.status).toBe("hydrated");
    expect(result.diagnostics.actionCount).toBe(dto.actions.length);
    expect(result.diagnostics.platformActionCount).toBe(
      PLATFORM_ACTION_CATALOGUE.length,
    );
    expect(result.diagnostics.capabilityActionCount).toBe(1);
    expect(result.diagnostics.source).toBe("server-dto");
    expect(result.diagnostics.synchronisation.mode).toBe("hydration");
  });

  it("filters commands by query via list()", () => {
    const result = createCommandRegistryFromDto(sampleDto());
    const matches = result.registry.list({ query: "theme" });

    expect(matches).toHaveLength(1);
    expect(matches[0]?.id).toBe("platform.theme.toggle");
  });

  it("exposes frozen descriptors that cannot be mutated", () => {
    const result = createCommandRegistryFromDto(sampleDto());
    const descriptor = result.registry.get("platform.theme.toggle");

    expect(() => {
      (descriptor as { label: string }).label = "Changed";
    }).toThrow();
  });

  it("does not expose mutation APIs", () => {
    const registry = createCommandRegistryFromDto(sampleDto()).registry;

    expect("register" in registry).toBe(false);
    expect("replace" in registry).toBe(false);
    expect("clear" in registry).toBe(false);
    expect("registerMany" in registry).toBe(false);
    expect("registerManyAtomic" in registry).toBe(false);
  });

  it("returns invalid registry for malformed DTO", () => {
    const result = createCommandRegistryFromDto({
      actions: "not-an-array",
      toolbar: [],
    });

    expect(result.ok).toBe(false);
    expect(result.registry.list()).toHaveLength(0);
    expect(result.diagnostics.status).toBe("invalid");
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it("supports empty DTO as ready empty registry", () => {
    const result = createCommandRegistryFromDto({ actions: [], toolbar: [] });

    expect(result.ok).toBe(true);
    expect(result.registry.list()).toEqual([]);
    expect(result.diagnostics.status).toBe("empty");
    expect(result.shortcuts.diagnostics.status).toBe("empty");
  });

  it("hydrates shortcut registry from dto action shortcuts", () => {
    const result = createCommandRegistryFromDto(
      sampleDto({
        actions: sampleDto().actions.map((action) =>
          action.id === "platform.theme.toggle"
            ? { ...action, shortcut: "Ctrl+Shift+T" }
            : action,
        ),
      }),
    );

    expect(result.ok).toBe(true);
    expect(result.shortcuts.diagnostics.registrationCount).toBe(1);
    expect(result.shortcuts.registry.lookup("Ctrl+Shift+T")).toBe(
      "platform.theme.toggle",
    );
  });
});

describe("ClientActionRegistry", () => {
  it("createEmptyClientActionRegistry returns empty diagnostics", () => {
    const registry = createEmptyClientActionRegistry();
    expect(registry.getDiagnostics().actionCount).toBe(0);
    expect(registry.getDiagnostics().status).toBe("empty");
  });

  it("is an instance of ClientActionRegistry", () => {
    const registry = createCommandRegistryFromDto(sampleDto()).registry;
    expect(registry).toBeInstanceOf(ClientActionRegistry);
  });
});
