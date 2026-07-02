import { describe, expect, it } from "vitest";

import type { ActionCapabilityRecord } from "./types";
import { extractActionDescriptorsFromCapabilities } from "./extract-actions";
import {
  inferActionHandlerKind,
  mapWorkbenchActionToDescriptor,
} from "./map-action-manifest";
import { populateRegistryFromCapabilities } from "./populate-registry";
import { createDefaultActionRegistry } from "../registry/default-action-registry";

function capability(
  overrides: Partial<ActionCapabilityRecord> & Pick<ActionCapabilityRecord, "id">,
): ActionCapabilityRecord {
  return {
    kind: "module",
    lifecycleState: "active",
    manifest: {},
    ...overrides,
  };
}

describe("mapWorkbenchActionToDescriptor", () => {
  it("maps manifest row to ActionDescriptor", () => {
    const descriptor = mapWorkbenchActionToDescriptor(
      {
        id: "platform.theme.toggle",
        label: "Toggle Theme",
        handler: "service:theme-service:toggle",
        group: "appearance",
        order: 5,
      },
      "default-theme",
    );

    expect(descriptor.source).toBe("manifest");
    expect(descriptor.capabilityId).toBe("default-theme");
    expect(descriptor.handlerKind).toBe("service");
  });

  it("stamps capability version on manifest actions", () => {
    const descriptor = mapWorkbenchActionToDescriptor(
      {
        id: "platform.theme.toggle",
        label: "Toggle Theme",
        handler: "service:theme-service:toggle",
      },
      "default-theme",
      "1.4.2",
    );

    expect(descriptor.version).toBe("1.4.2");
  });

  it("infers handler kinds", () => {
    expect(inferActionHandlerKind("workbench-bridge:workbench.view.open")).toBe(
      "workbench-bridge",
    );
    expect(inferActionHandlerKind("service:theme-service:toggle")).toBe("service");
    expect(inferActionHandlerKind("event:platform.ready")).toBe("event");
  });
});

describe("extractActionDescriptorsFromCapabilities", () => {
  it("extracts actions from workbench.actions", () => {
    const result = extractActionDescriptorsFromCapabilities([
      capability({
        id: "theme-a",
        manifest: {
          workbench: {
            actions: [
              {
                id: "platform.theme.toggle",
                label: "Toggle Theme",
                handler: "service:theme-service:toggle",
              },
            ],
          },
        },
      }),
    ]);

    expect(result.ok).toBe(true);
    expect(result.descriptors).toHaveLength(1);
    expect(result.diagnostics.extractedCount).toBe(1);
  });

  it("merges legacy workbench.commands", () => {
    const result = extractActionDescriptorsFromCapabilities([
      capability({
        id: "theme-b",
        manifest: {
          workbench: {
            commands: [
              {
                id: "platform.theme.legacy",
                label: "Legacy",
                handler: "service:theme-service:toggle",
              },
            ],
          },
        },
      }),
    ]);

    expect(result.ok).toBe(true);
    expect(result.descriptors[0]?.id).toBe("platform.theme.legacy");
  });

  it("returns structured errors for duplicate action ids across capabilities", () => {
    const result = extractActionDescriptorsFromCapabilities([
      capability({
        id: "cap-a",
        manifest: {
          workbench: {
            actions: [
              {
                id: "platform.shared.action",
                label: "A",
                handler: "service:a:run",
              },
            ],
          },
        },
      }),
      capability({
        id: "cap-b",
        manifest: {
          workbench: {
            actions: [
              {
                id: "platform.shared.action",
                label: "B",
                handler: "service:b:run",
              },
            ],
          },
        },
      }),
    ]);

    expect(result.ok).toBe(false);
    expect(result.descriptors).toHaveLength(0);
    expect(result.errors.some((issue) => issue.code === "DUPLICATE_ID")).toBe(true);
  });

  it("skips inactive capabilities by default", () => {
    const result = extractActionDescriptorsFromCapabilities([
      capability({
        id: "inactive-cap",
        lifecycleState: "discovered",
        manifest: {
          workbench: {
            actions: [
              {
                id: "platform.inactive",
                label: "Inactive",
                handler: "service:inactive:run",
              },
            ],
          },
        },
      }),
    ]);

    expect(result.ok).toBe(true);
    expect(result.descriptors).toHaveLength(0);
    expect(result.diagnostics.skippedInactive).toBe(1);
  });

  it("processes capabilities in deterministic id order", () => {
    const result = extractActionDescriptorsFromCapabilities([
      capability({
        id: "z-cap",
        manifest: {
          workbench: {
            actions: [
              { id: "z.action", label: "Z", handler: "service:z:run", order: 1 },
            ],
          },
        },
      }),
      capability({
        id: "a-cap",
        manifest: {
          workbench: {
            actions: [
              { id: "a.action", label: "A", handler: "service:a:run", order: 1 },
            ],
          },
        },
      }),
    ]);

    expect(result.ok).toBe(true);
    expect(result.diagnostics.capabilityIds).toEqual(["a-cap", "z-cap"]);
  });
});

describe("populateRegistryFromCapabilities", () => {
  it("registers extracted actions atomically", () => {
    const registry = createDefaultActionRegistry();
    const result = populateRegistryFromCapabilities(registry, [
      capability({
        id: "theme-cap",
        manifest: {
          workbench: {
            actions: [
              {
                id: "platform.theme.toggle",
                label: "Toggle Theme",
                handler: "service:theme-service:toggle",
              },
            ],
          },
        },
      }),
    ]);

    expect(result.ok).toBe(true);
    expect(result.registeredCount).toBe(1);
    expect(registry.has("platform.theme.toggle")).toBe(true);
    expect(registry.getDiagnostics().manifestCapabilities).toEqual(["theme-cap"]);
    expect(registry.getDiagnostics().manifestCapabilityCount).toBe(1);
  });

  it("does not register when extraction fails", () => {
    const registry = createDefaultActionRegistry();
    const result = populateRegistryFromCapabilities(registry, [
      capability({
        id: "cap-a",
        manifest: {
          workbench: {
            actions: [{ id: "dup.action", label: "A", handler: "service:a:run" }],
          },
        },
      }),
      capability({
        id: "cap-b",
        manifest: {
          workbench: {
            actions: [{ id: "dup.action", label: "B", handler: "service:b:run" }],
          },
        },
      }),
    ]);

    expect(result.ok).toBe(false);
    expect(registry.list()).toHaveLength(0);
  });
});
