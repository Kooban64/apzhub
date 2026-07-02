import { describe, expect, it } from "vitest";

import type { ActionDescriptor } from "../types";
import {
  filterActionsByContext,
  matchesActionContextPredicate,
} from "./context-filter";

function descriptor(
  overrides: Partial<ActionDescriptor> & Pick<ActionDescriptor, "id" | "label">,
): ActionDescriptor {
  return {
    handler: "service:example:run",
    handlerKind: "service",
    source: "manifest",
    ...overrides,
  };
}

describe("matchesActionContextPredicate", () => {
  it("matches when contextWhen is omitted", () => {
    expect(
      matchesActionContextPredicate(descriptor({ id: "a", label: "A" }), {
        surface: "workspace",
        selection: { mode: "single" },
        context: { contextTypes: ["record.item"] },
      }),
    ).toBe(true);
  });

  it("filters by surface", () => {
    const action = descriptor({
      id: "workspace.action",
      label: "Workspace",
      contextWhen: { surfaces: ["workspace"] },
    });

    expect(matchesActionContextPredicate(action, { surface: "workspace" })).toBe(true);
    expect(matchesActionContextPredicate(action, { surface: "sidebar" })).toBe(false);
  });

  it("filters by selection kind", () => {
    const action = descriptor({
      id: "single.action",
      label: "Single",
      contextWhen: { selectionKinds: ["single"] },
    });

    expect(
      matchesActionContextPredicate(action, { selection: { mode: "single" } }),
    ).toBe(true);
    expect(matchesActionContextPredicate(action, { selection: { mode: "none" } })).toBe(
      false,
    );
    expect(matchesActionContextPredicate(action, {})).toBe(false);
  });

  it("filters by context types", () => {
    const action = descriptor({
      id: "record.action",
      label: "Record",
      contextWhen: { contextTypes: ["record.item"] },
    });

    expect(
      matchesActionContextPredicate(action, {
        context: { contextTypes: ["record.item", "other"] },
      }),
    ).toBe(true);
    expect(
      matchesActionContextPredicate(action, {
        context: { contextTypes: ["other"] },
      }),
    ).toBe(false);
    expect(matchesActionContextPredicate(action, {})).toBe(false);
  });
});

describe("filterActionsByContext", () => {
  it("returns empty list for empty input", () => {
    expect(filterActionsByContext([], { surface: "workspace" })).toEqual([]);
  });

  it("combines surface, selection, and context filters", () => {
    const actions = [
      descriptor({
        id: "match",
        label: "Match",
        contextWhen: {
          surfaces: ["workspace"],
          selectionKinds: ["single"],
          contextTypes: ["record.item"],
        },
      }),
      descriptor({
        id: "miss",
        label: "Miss",
        contextWhen: { surfaces: ["sidebar"] },
      }),
    ];

    const filtered = filterActionsByContext(actions, {
      surface: "workspace",
      selection: { mode: "single" },
      context: { contextTypes: ["record.item"] },
    });

    expect(filtered.map((action) => action.id)).toEqual(["match"]);
  });
});
