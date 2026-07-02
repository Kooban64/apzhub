import { describe, expect, it } from "vitest";

import type { ActionDescriptor } from "../types";
import {
  createDefaultActionRegistry,
  DefaultActionRegistry,
} from "./default-action-registry";
import { filterActionDescriptors } from "./filter-action-descriptors";
import { freezeActionDescriptor } from "./freeze-action-descriptor";
import {
  ActionRegistryDuplicateError,
  ActionRegistryNotFoundError,
  ActionRegistryValidationError,
} from "./registry-errors";
import { validateActionDescriptor } from "./validate-action-descriptor";

function sampleDescriptor(overrides: Partial<ActionDescriptor> = {}): ActionDescriptor {
  return {
    id: "platform.theme.toggle",
    label: "Toggle Theme",
    handler: "service:theme-service:toggle",
    handlerKind: "service",
    source: "manifest",
    capabilityId: "default-theme",
    ...overrides,
  };
}

describe("validateActionDescriptor", () => {
  it("accepts a valid descriptor", () => {
    expect(() => validateActionDescriptor(sampleDescriptor())).not.toThrow();
  });

  it("rejects empty id", () => {
    expect(() => validateActionDescriptor(sampleDescriptor({ id: "  " }))).toThrow(
      ActionRegistryValidationError,
    );
  });

  it("rejects invalid id format", () => {
    expect(() => validateActionDescriptor(sampleDescriptor({ id: "Bad_ID" }))).toThrow(
      ActionRegistryValidationError,
    );
  });

  it("rejects empty label", () => {
    expect(() => validateActionDescriptor(sampleDescriptor({ label: "" }))).toThrow(
      ActionRegistryValidationError,
    );
  });

  it("rejects empty handler", () => {
    expect(() => validateActionDescriptor(sampleDescriptor({ handler: "" }))).toThrow(
      ActionRegistryValidationError,
    );
  });

  it("rejects invalid handlerKind", () => {
    expect(() =>
      validateActionDescriptor(
        sampleDescriptor({ handlerKind: "invalid" as ActionDescriptor["handlerKind"] }),
      ),
    ).toThrow(ActionRegistryValidationError);
  });

  it("rejects invalid source", () => {
    expect(() =>
      validateActionDescriptor(
        sampleDescriptor({ source: "invalid" as ActionDescriptor["source"] }),
      ),
    ).toThrow(ActionRegistryValidationError);
  });

  it("rejects non-finite order", () => {
    expect(() =>
      validateActionDescriptor(sampleDescriptor({ order: Number.NaN })),
    ).toThrow(ActionRegistryValidationError);
  });
});

describe("freezeActionDescriptor", () => {
  it("deep-freezes descriptor and nested contextWhen", () => {
    const frozen = freezeActionDescriptor(
      sampleDescriptor({
        contextWhen: { surfaces: ["workspace"], selectionKinds: ["single"] },
      }),
    );

    expect(Object.isFrozen(frozen)).toBe(true);
    expect(Object.isFrozen(frozen.contextWhen)).toBe(true);
    expect(Object.isFrozen(frozen.contextWhen?.surfaces)).toBe(true);

    expect(() => {
      (frozen as { label: string }).label = "Changed";
    }).toThrow();
  });
});

describe("DefaultActionRegistry", () => {
  it("registers and retrieves an action by id", () => {
    const registry = createDefaultActionRegistry();
    const descriptor = sampleDescriptor();

    registry.register(descriptor);

    expect(registry.has("platform.theme.toggle")).toBe(true);
    expect(registry.get("platform.theme.toggle")?.label).toBe("Toggle Theme");
  });

  it("rejects duplicate registration", () => {
    const registry = createDefaultActionRegistry();
    registry.register(sampleDescriptor());

    expect(() => registry.register(sampleDescriptor())).toThrow(
      ActionRegistryDuplicateError,
    );
  });

  it("registerMany rejects duplicate within batch", () => {
    const registry = createDefaultActionRegistry();

    expect(() =>
      registry.registerMany([
        sampleDescriptor(),
        sampleDescriptor({ label: "Duplicate Label" }),
      ]),
    ).toThrow(ActionRegistryDuplicateError);
  });

  it("registerMany rejects duplicate against existing entries", () => {
    const registry = createDefaultActionRegistry();
    registry.register(sampleDescriptor());

    expect(() =>
      registry.registerMany([sampleDescriptor({ label: "Another label" })]),
    ).toThrow(ActionRegistryDuplicateError);
  });

  it("replace updates an existing descriptor without changing id", () => {
    const registry = createDefaultActionRegistry();
    registry.register(sampleDescriptor());

    registry.replace(sampleDescriptor({ label: "Switch Theme" }));

    expect(registry.get("platform.theme.toggle")?.label).toBe("Switch Theme");
  });

  it("replace throws when id is not registered", () => {
    const registry = createDefaultActionRegistry();

    expect(() => registry.replace(sampleDescriptor())).toThrow(
      ActionRegistryNotFoundError,
    );
  });

  it("returns frozen copies from get that do not mutate stored entry", () => {
    const registry = createDefaultActionRegistry();
    registry.register(sampleDescriptor());

    const retrieved = registry.get("platform.theme.toggle");
    expect(retrieved?.label).toBe("Toggle Theme");

    expect(() => {
      (retrieved as { label: string }).label = "Mutated";
    }).toThrow();

    expect(registry.get("platform.theme.toggle")?.label).toBe("Toggle Theme");
  });

  it("lists all actions sorted by order, group, label, then id", () => {
    const registry = createDefaultActionRegistry();
    registry.registerMany([
      sampleDescriptor({ id: "b.action", label: "B", group: "beta", order: 20 }),
      sampleDescriptor({
        id: "a.action",
        label: "A",
        group: "alpha",
        order: 10,
        handler: "service:a:run",
      }),
      sampleDescriptor({
        id: "c.action",
        label: "C",
        group: "alpha",
        order: 10,
        handler: "service:c:run",
      }),
    ]);

    expect(registry.list().map((item) => item.id)).toEqual([
      "a.action",
      "c.action",
      "b.action",
    ]);
  });

  it("filters by query on label and id", () => {
    const registry = createDefaultActionRegistry();
    registry.registerMany([
      sampleDescriptor(),
      sampleDescriptor({
        id: "workbench.view.open",
        label: "Open View",
        handlerKind: "workbench-bridge",
        handler: "workbench-bridge:workbench.view.open",
      }),
    ]);

    const results = registry.list({ query: "theme" });
    expect(results).toHaveLength(1);
    expect(results[0]?.id).toBe("platform.theme.toggle");
  });

  it("filters palette-visible actions", () => {
    const registry = createDefaultActionRegistry();
    registry.registerMany([
      sampleDescriptor({ palette: true }),
      sampleDescriptor({
        id: "hidden.action",
        label: "Hidden",
        palette: false,
        handler: "service:hidden:run",
      }),
    ]);

    expect(registry.list({ palette: true })).toHaveLength(1);
    expect(registry.list({ palette: false })).toHaveLength(1);
  });

  it("filters by surface when contextWhen is declared", () => {
    const registry = createDefaultActionRegistry();
    registry.registerMany([
      sampleDescriptor({
        id: "workspace.action",
        contextWhen: { surfaces: ["workspace"] },
      }),
      sampleDescriptor({
        id: "sidebar.action",
        label: "Sidebar",
        contextWhen: { surfaces: ["sidebar"] },
        handler: "service:sidebar:run",
      }),
    ]);

    expect(registry.list({ surface: "workspace" }).map((item) => item.id)).toEqual([
      "workspace.action",
    ]);
  });

  it("filters by selection kind and context types", () => {
    const registry = createDefaultActionRegistry();
    registry.registerMany([
      sampleDescriptor({
        id: "single.record",
        contextWhen: {
          surfaces: ["workspace"],
          selectionKinds: ["single"],
          contextTypes: ["record.item"],
        },
      }),
      sampleDescriptor({
        id: "none.action",
        label: "None",
        handler: "service:none:run",
        contextWhen: { selectionKinds: ["none"] },
      }),
    ]);

    expect(
      registry
        .list({
          surface: "workspace",
          selection: { mode: "single" },
          context: { contextTypes: ["record.item"] },
        })
        .map((item) => item.id),
    ).toEqual(["single.record"]);
  });

  it("clear removes all actions", () => {
    const registry = createDefaultActionRegistry();
    registry.register(sampleDescriptor());
    registry.clear();

    expect(registry.list()).toEqual([]);
    expect(registry.getDiagnostics().registeredCount).toBe(0);
  });

  it("registerManyAtomic rejects invalid descriptors without registering", () => {
    const registry = createDefaultActionRegistry();
    registry.register(sampleDescriptor());

    const result = registry.registerManyAtomic([
      sampleDescriptor({
        id: "valid.action",
        label: "Valid",
        handler: "service:valid:run",
      }),
      sampleDescriptor({ id: "bad id", label: "Bad", handler: "service:bad:run" }),
    ]);

    expect(result.ok).toBe(false);
    expect(result.registeredCount).toBe(0);
    expect(result.errors.some((issue) => issue.code === "VALIDATION")).toBe(true);
    expect(registry.has("valid.action")).toBe(false);
    expect(registry.getDiagnostics().registeredCount).toBe(1);
  });

  it("registerManyAtomic rejects duplicate ids without registering", () => {
    const registry = createDefaultActionRegistry();

    const result = registry.registerManyAtomic([
      sampleDescriptor({ id: "dup.action", label: "One", handler: "service:one:run" }),
      sampleDescriptor({ id: "dup.action", label: "Two", handler: "service:two:run" }),
    ]);

    expect(result.ok).toBe(false);
    expect(registry.list()).toHaveLength(0);
    expect(result.errors[0]?.code).toBe("DUPLICATE_ID");
  });

  it("reports ready diagnostics with sorted ids", () => {
    const registry = createDefaultActionRegistry();
    registry.registerMany([
      sampleDescriptor({ id: "z.action", label: "Z" }),
      sampleDescriptor({ id: "a.action", label: "A", handler: "service:a:run" }),
    ]);

    const diagnostics = registry.getDiagnostics();
    expect(diagnostics.status).toBe("ready");
    expect(diagnostics.registeredCount).toBe(2);
    expect(diagnostics.actionIds).toEqual(["a.action", "z.action"]);
  });
});

describe("filterActionDescriptors", () => {
  it("sorts without options", () => {
    const sorted = filterActionDescriptors([
      sampleDescriptor({ id: "b.action", label: "B", order: 2 }),
      sampleDescriptor({
        id: "a.action",
        label: "A",
        order: 1,
        handler: "service:a:run",
      }),
    ]);

    expect(sorted.map((item) => item.id)).toEqual(["a.action", "b.action"]);
  });
});

describe("DefaultActionRegistry class export", () => {
  it("is constructable", () => {
    expect(new DefaultActionRegistry()).toBeInstanceOf(DefaultActionRegistry);
  });
});
