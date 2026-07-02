import { describe, expect, it } from "vitest";

import {
  CAPABILITY_LIFECYCLE_PROGRESSION,
  type CapabilityLifecycleState,
} from "../capability/types";
import {
  CapabilityLifecycleManager,
  createCapabilityLifecycleManager,
} from "./manager";
import {
  canTransitionBetween,
  getAllowedTransitions,
  isFailureState,
} from "./transitions";

describe("lifecycle transitions", () => {
  it("defines a linear happy-path progression", () => {
    for (let i = 0; i < CAPABILITY_LIFECYCLE_PROGRESSION.length - 1; i += 1) {
      const from = CAPABILITY_LIFECYCLE_PROGRESSION[i]!;
      const to = CAPABILITY_LIFECYCLE_PROGRESSION[i + 1]!;
      expect(canTransitionBetween(from, to)).toBe(true);
    }
  });

  it("allows untracked capabilities to enter discovered", () => {
    expect(getAllowedTransitions(null)).toEqual(["discovered"]);
    expect(canTransitionBetween(null, "discovered")).toBe(true);
    expect(canTransitionBetween(null, "validated")).toBe(false);
  });

  it("identifies failure states", () => {
    expect(isFailureState("failed")).toBe(true);
    expect(isFailureState("disabled")).toBe(true);
    expect(isFailureState("degraded")).toBe(true);
    expect(isFailureState("healthy")).toBe(false);
  });
});

describe("CapabilityLifecycleManager", () => {
  const timestamps = [
    "2026-06-28T10:00:00.000Z",
    "2026-06-28T10:00:01.000Z",
    "2026-06-28T10:00:02.000Z",
    "2026-06-28T10:00:03.000Z",
    "2026-06-28T10:00:04.000Z",
    "2026-06-28T10:00:05.000Z",
    "2026-06-28T10:00:06.000Z",
    "2026-06-28T10:00:07.000Z",
    "2026-06-28T10:00:08.000Z",
    "2026-06-28T10:00:09.000Z",
    "2026-06-28T10:00:10.000Z",
    "2026-06-28T10:00:11.000Z",
    "2026-06-28T10:00:12.000Z",
    "2026-06-28T10:00:13.000Z",
    "2026-06-28T10:00:14.000Z",
    "2026-06-28T10:00:15.000Z",
  ];
  let tick = 0;

  function createManager() {
    tick = 0;
    return createCapabilityLifecycleManager({
      now: () => timestamps[tick++] ?? `2026-06-28T10:00:${tick}.000Z`,
    });
  }

  function advanceHappyPath(
    manager: ReturnType<typeof createManager>,
    capabilityId: string,
  ) {
    manager.reset(capabilityId);
    const steps = CAPABILITY_LIFECYCLE_PROGRESSION.slice(1);
    for (const step of steps) {
      const result = manager.transition(capabilityId, step, { source: "test" });
      expect(result.success).toBe(true);
    }
  }

  it("uses the default clock when constructed without options", () => {
    const manager = new CapabilityLifecycleManager();
    manager.reset("alpha");
    expect(manager.snapshot().timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it("creates managers via factory helper", () => {
    const manager = createCapabilityLifecycleManager();
    expect(manager.getState("missing")).toBeUndefined();
  });

  it("tracks reset state and history", () => {
    const manager = createManager();
    expect(manager.reset("alpha")).toBe(true);
    expect(manager.getState("alpha")).toBe("discovered");
    expect(manager.getHistory("alpha")).toHaveLength(1);
    expect(manager.getHistory("alpha")[0]?.reason).toBe("reset");
  });

  it("rejects reset for empty capability id", () => {
    const manager = createManager();
    expect(manager.reset("")).toBe(false);
  });

  it("advances through valid transitions", () => {
    const manager = createManager();
    advanceHappyPath(manager, "button");
    expect(manager.getState("button")).toBe("active");
    expect(manager.getHistory("button").length).toBe(
      CAPABILITY_LIFECYCLE_PROGRESSION.length,
    );
  });

  it("rejects invalid transitions", () => {
    const manager = createManager();
    manager.reset("alpha");

    expect(manager.canTransition("alpha", "registered")).toBe(false);
    const result = manager.transition("alpha", "registered");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors[0]?.code).toBe("LIFECYCLE_INVALID_TRANSITION");
    }
    expect(manager.getState("alpha")).toBe("discovered");
  });

  it("rejects transitions for untracked capabilities", () => {
    const manager = createManager();
    expect(manager.getState("missing")).toBeUndefined();

    const result = manager.transition("missing", "validated");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors[0]?.code).toBe("LIFECYCLE_NOT_TRACKED");
    }
  });

  it("allows first transition to discovered for untracked capabilities", () => {
    const manager = createManager();
    const result = manager.transition("new-cap", "discovered", { source: "discovery" });
    expect(result.success).toBe(true);
    expect(manager.getState("new-cap")).toBe("discovered");
  });

  it("records transition context for audit integration", () => {
    const manager = createManager();
    manager.reset("alpha");
    manager.transition("alpha", "validated", {
      reason: "manifest valid",
      source: "manifest-engine",
      auditRef: "audit-001",
    });

    const record = manager.getHistory("alpha").at(-1);
    expect(record).toMatchObject({
      from: "discovered",
      to: "validated",
      reason: "manifest valid",
      source: "manifest-engine",
      auditRef: "audit-001",
    });
  });

  it("marks capabilities failed and disabled", () => {
    const manager = createManager();
    manager.reset("alpha");
    manager.transition("alpha", "validated");

    const failed = manager.markFailed("alpha", "dependency timeout");
    expect(failed.success).toBe(true);
    expect(manager.getState("alpha")).toBe("failed");

    manager.reset("beta");
    manager.transition("beta", "validated");
    const disabled = manager.markDisabled("beta", "admin disable");
    expect(disabled.success).toBe(true);
    expect(manager.getState("beta")).toBe("disabled");
  });

  it("supports degraded recovery flows", () => {
    const manager = createManager();
    advanceHappyPath(manager, "service");
    manager.transition("service", "degraded", { reason: "latency spike" });
    expect(manager.getState("service")).toBe("degraded");

    const recovered = manager.transition("service", "healthy", { reason: "recovered" });
    expect(recovered.success).toBe(true);
    expect(manager.getState("service")).toBe("healthy");
  });

  it("supports failed recovery to discovered", () => {
    const manager = createManager();
    manager.reset("alpha");
    manager.markFailed("alpha", "init error");
    const retry = manager.transition("alpha", "discovered", {
      reason: "retry bootstrap",
    });
    expect(retry.success).toBe(true);
    expect(manager.getState("alpha")).toBe("discovered");
  });

  it("supports re-enable from disabled", () => {
    const manager = createManager();
    manager.reset("alpha");
    manager.markDisabled("alpha");
    const enabled = manager.transition("alpha", "discovered", { reason: "re-enabled" });
    expect(enabled.success).toBe(true);
  });

  it("exposes diagnostics", () => {
    const manager = createManager();
    manager.reset("alpha");
    const diagnostics = manager.getDiagnostics("alpha");
    expect(diagnostics.currentState).toBe("discovered");
    expect(diagnostics.allowedTransitions).toContain("validated");
    expect(diagnostics.transitionCount).toBe(1);
    expect(diagnostics.lastTransition?.to).toBe("discovered");
  });

  it("produces deterministic snapshots", () => {
    const manager = createManager();
    manager.reset("alpha");
    manager.reset("beta");
    manager.transition("alpha", "validated");

    const snapshot = manager.snapshot();
    expect(snapshot.capabilityCount).toBe(2);
    expect(snapshot.stateSummary.discovered).toBe(1);
    expect(snapshot.stateSummary.validated).toBe(1);
    expect(snapshot.capabilities.map((c) => c.capabilityId)).toEqual(["alpha", "beta"]);
    expect(snapshot.timestamp).toBeTruthy();
  });

  it("aggregates snapshot counts for multiple capabilities in the same state", () => {
    const manager = createManager();
    manager.reset("alpha");
    manager.reset("beta");
    manager.reset("gamma");

    const snapshot = manager.snapshot();
    expect(snapshot.stateSummary.discovered).toBe(3);
  });

  it("clears tracked capabilities", () => {
    const manager = createManager();
    manager.reset("alpha");
    manager.clear();
    expect(manager.getState("alpha")).toBeUndefined();
    expect(manager.snapshot().capabilityCount).toBe(0);
  });

  it("rejects empty capability id transitions", () => {
    const manager = createManager();
    const result = manager.transition("", "discovered");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors[0]?.code).toBe("LIFECYCLE_INVALID_INPUT");
    }
  });

  it("uses default reasons for markFailed and markDisabled", () => {
    const manager = createManager();
    manager.reset("alpha");
    manager.transition("alpha", "validated");

    const failed = manager.markFailed("alpha");
    expect(failed.success).toBe(true);
    if (failed.success) {
      expect(failed.record.reason).toBe("marked failed");
    }

    manager.reset("beta");
    manager.transition("beta", "validated");
    const disabled = manager.markDisabled("beta");
    expect(disabled.success).toBe(true);
    if (disabled.success) {
      expect(disabled.record.reason).toBe("marked disabled");
    }
  });

  it("returns empty history for unknown capabilities", () => {
    const manager = createManager();
    const diagnostics = manager.getDiagnostics("missing");
    expect(diagnostics.currentState).toBeUndefined();
    expect(diagnostics.allowedTransitions).toEqual(["discovered"]);
    expect(diagnostics.transitionCount).toBe(0);
    expect(diagnostics.lastTransition).toBeUndefined();
  });

  it("rejects repeated disable transitions", () => {
    const manager = createManager();
    manager.reset("alpha");
    manager.markDisabled("alpha");
    const again = manager.markDisabled("alpha");
    expect(again.success).toBe(false);
  });

  it("rejects markFailed for untracked capabilities", () => {
    const manager = createManager();
    expect(manager.markFailed("missing").success).toBe(false);
  });

  it("rejects canTransition for falsy target state", () => {
    const manager = createManager();
    expect(
      manager.canTransition("alpha", undefined as unknown as CapabilityLifecycleState),
    ).toBe(false);
  });

  it("evaluates canTransition for tracked and untracked capabilities", () => {
    const manager = createManager();
    expect(manager.canTransition("new-cap", "discovered")).toBe(true);
    expect(manager.canTransition("new-cap", "validated")).toBe(false);

    manager.reset("alpha");
    expect(manager.canTransition("alpha", "validated")).toBe(true);
    expect(manager.canTransition("alpha", "active")).toBe(false);
  });

  it("rejects canTransition for empty ids", () => {
    const manager = createManager();
    expect(manager.canTransition("", "discovered")).toBe(false);
  });
});
