import { describe, expect, it } from "vitest";

import {
  COMMERCIAL_READINESS_HOOK_IDS,
  getCommercialReadinessHooks,
  listCommercialReadinessHookIds,
} from "./commercial-readiness-hooks";

describe("PRH-015 commercial readiness hooks", () => {
  it("exposes the full monitoring hook catalogue", () => {
    const snapshot = getCommercialReadinessHooks();
    expect(snapshot.version).toBe("prh-015");
    expect(snapshot.provisioningImplemented).toBe(false);
    expect(snapshot.hooks).toHaveLength(COMMERCIAL_READINESS_HOOK_IDS.length);
    expect(listCommercialReadinessHookIds()).toEqual([
      ...COMMERCIAL_READINESS_HOOK_IDS,
    ]);
  });

  it("defaults hooks to unknown (design-only evaluation)", () => {
    const snapshot = getCommercialReadinessHooks();
    for (const hook of snapshot.hooks) {
      expect(hook.status).toBe("unknown");
    }
  });

  it("accepts status overrides for future evaluators", () => {
    const snapshot = getCommercialReadinessHooks({
      "onboarding.health.ready": { status: "pass", detail: "READY" },
    });
    const health = snapshot.hooks.find((h) => h.id === "onboarding.health.ready");
    expect(health?.status).toBe("pass");
    expect(health?.detail).toBe("READY");
  });
});
