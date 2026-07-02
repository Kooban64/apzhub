import { describe, expect, it, vi } from "vitest";

import { createWorkbenchRequestBus } from "./request-bus";

describe("WorkbenchRequestBus", () => {
  it("routes publish to Workbench Manager", () => {
    const bus = createWorkbenchRequestBus();
    const result = bus.publish({
      type: "openPanel",
      panelId: "context",
      tabKey: "activity",
    });

    expect(result.ok).toBe(true);
    expect(bus.getState().panels.context.activeTabKey).toBe("activity");
  });

  it("notifies subscribers after publish", () => {
    const bus = createWorkbenchRequestBus();
    const listener = vi.fn();
    bus.subscribe(listener);

    bus.publish({ type: "closePanel", panelId: "sidebar" });

    expect(listener).toHaveBeenCalledOnce();
  });

  it("provides capability context with Workbench API", () => {
    const bus = createWorkbenchRequestBus({
      dependencies: {
        viewDescriptors: [
          {
            viewId: "platform-home",
            capabilityId: "platform-home",
            capabilityKind: "module",
            title: "Home",
            workspace: "home",
          },
        ],
      },
    });
    const { workbench } = bus.createCapabilityRegistrationContext();

    expect(workbench.version).toBe("1.0");
    const result = workbench.views.open("platform-home");
    expect(result.ok).toBe(true);
  });

  it("returns invalid selection when no active view is open", () => {
    const bus = createWorkbenchRequestBus();
    const result = bus.publish({
      type: "setSelection",
      selection: { items: [{ id: "row-1", kind: "row" }] },
    });

    expect(result.ok).toBe(false);
    expect(result.error?.engineId).toBe("selection");
  });
});
