import { describe, expect, it } from "vitest";

import { createAllowAllWorkbenchPermissionAdapter } from "../../permission/allow-all-adapter";
import { createScaffoldWorkbenchPermissionAdapter } from "../../permission/scaffold-permission-adapter";
import { createSelectionEngine } from "./selection-engine";

describe("SelectionEngine", () => {
  it("supports single selection for the active view", () => {
    const engine = createSelectionEngine({
      permissionAdapter: createAllowAllWorkbenchPermissionAdapter(),
    });

    engine.switchActiveView("platform-home-overview");
    const result = engine.handleRequest({
      type: "setSelection",
      selection: {
        mode: "single",
        items: [
          { id: "row-1", kind: "table-row" },
          { id: "row-2", kind: "table-row" },
        ],
      },
    });

    expect(result.ok).toBe(true);
    expect(engine.getState().items).toEqual([{ id: "row-1", kind: "table-row" }]);
    expect(engine.getState().mode).toBe("single");
    expect(engine.getDiagnostics().itemCount).toBe(1);
  });

  it("supports multi selection and clear selection", () => {
    const engine = createSelectionEngine({
      permissionAdapter: createAllowAllWorkbenchPermissionAdapter(),
    });

    engine.switchActiveView("platform-home-overview");
    engine.handleRequest({
      type: "setSelection",
      selection: {
        mode: "multi",
        items: [
          { id: "row-1", kind: "table-row" },
          { id: "row-2", kind: "table-row" },
        ],
      },
    });

    expect(engine.getState().mode).toBe("multi");
    expect(engine.getState().items).toHaveLength(2);

    engine.handleRequest({
      type: "setSelection",
      selection: { mode: "clear", items: [] },
    });

    expect(engine.getState().items).toEqual([]);
    expect(engine.getState().mode).toBe("none");
  });

  it("drops inaccessible selection items via permission adapter", () => {
    const engine = createSelectionEngine({
      permissionAdapter: createScaffoldWorkbenchPermissionAdapter({
        context: {
          userId: "u1",
          roles: [],
          permissions: new Set(["platform.selection.allowed"]),
        },
      }),
    });

    engine.switchActiveView("platform-home-overview");
    engine.handleRequest({
      type: "setSelection",
      selection: {
        mode: "multi",
        items: [
          { id: "allowed", kind: "row", permission: "platform.selection.allowed" },
          { id: "denied", kind: "row", permission: "platform.selection.denied" },
        ],
      },
    });

    expect(engine.getState().items).toEqual([
      { id: "allowed", kind: "row", permission: "platform.selection.allowed" },
    ]);
    expect(engine.getDiagnostics().droppedInvalidCount).toBe(1);
  });

  it("restores sanitized selection for focused view", () => {
    const engine = createSelectionEngine({
      permissionAdapter: createAllowAllWorkbenchPermissionAdapter(),
    });

    engine.applySelection(
      {
        activeViewId: "platform-home-overview",
        mode: "single",
        items: [{ id: "row-1", kind: "table-row" }],
        byView: {
          "platform-home-overview": [{ id: "row-1", kind: "table-row" }],
        },
      },
      "platform-home-overview",
    );

    expect(engine.getState().items).toEqual([{ id: "row-1", kind: "table-row" }]);
  });
});
