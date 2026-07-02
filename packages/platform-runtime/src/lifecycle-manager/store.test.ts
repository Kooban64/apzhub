import { describe, expect, it } from "vitest";

import { invalidTransitionError, lifecycleError } from "./errors";
import { LifecycleStateStore } from "./store";

describe("lifecycleError", () => {
  it("creates structured lifecycle errors", () => {
    expect(
      lifecycleError("LIFECYCLE_NOT_TRACKED", "missing", { capabilityId: "x" }),
    ).toEqual({
      code: "LIFECYCLE_NOT_TRACKED",
      message: "missing",
      capabilityId: "x",
    });
  });

  it("creates invalid transition errors", () => {
    const error = invalidTransitionError("alpha", "discovered", "active");
    expect(error.code).toBe("LIFECYCLE_INVALID_TRANSITION");
    expect(error.capabilityId).toBe("alpha");
  });

  it("creates invalid transition errors for untracked capabilities", () => {
    const error = invalidTransitionError("alpha", null, "active");
    expect(error.from).toBeNull();
  });
});

describe("LifecycleStateStore", () => {
  it("returns empty accessors for unknown capabilities", () => {
    const store = new LifecycleStateStore();
    expect(store.getState("missing")).toBeUndefined();
    expect(store.getUpdatedAt("missing")).toBeUndefined();
    expect(store.getHistory("missing")).toEqual([]);
    expect(store.has("missing")).toBe(false);
  });

  it("tracks transitions and history", () => {
    const store = new LifecycleStateStore();
    expect(store.has("alpha")).toBe(false);

    store.applyTransition("alpha", "discovered", "t1");
    expect(store.getState("alpha")).toBe("discovered");
    expect(store.getHistory("alpha")).toHaveLength(1);

    store.applyTransition("alpha", "validated", "t2", { reason: "ok" });
    expect(store.getHistory("alpha")).toHaveLength(2);
    expect(store.getUpdatedAt("alpha")).toBe("t2");
    expect(store.getTrackedIds()).toEqual(["alpha"]);
    expect(store.count()).toBe(1);
  });

  it("resets brand new capabilities", () => {
    const store = new LifecycleStateStore();
    const record = store.reset("new", "t1");
    expect(record.from).toBeNull();
    expect(store.getHistory("new")).toHaveLength(1);
  });

  it("resets capabilities to discovered", () => {
    const store = new LifecycleStateStore();
    store.applyTransition("alpha", "validated", "t1");
    const record = store.reset("alpha", "t2");

    expect(record.to).toBe("discovered");
    expect(store.getState("alpha")).toBe("discovered");
    expect(store.getHistory("alpha")).toHaveLength(1);
  });

  it("clears all tracked capabilities", () => {
    const store = new LifecycleStateStore();
    store.applyTransition("alpha", "discovered", "t1");
    store.clear();
    expect(store.count()).toBe(0);
  });
});
