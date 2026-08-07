import { afterEach, describe, expect, it, vi } from "vitest";

import {
  defaultWorkspacePreferences,
  readWorkspacePreferences,
  writeWorkspacePreferences,
} from "./workspace-preferences";

describe("workspace preferences", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    if (typeof window !== "undefined") {
      window.localStorage?.clear();
    }
  });

  it("returns defaults when storage empty", () => {
    const store = new Map<string, string>();
    vi.stubGlobal("window", {
      localStorage: {
        getItem: (k: string) => store.get(k) ?? null,
        setItem: (k: string, v: string) => {
          store.set(k, v);
        },
      },
    });
    expect(readWorkspacePreferences()).toEqual(defaultWorkspacePreferences());
  });

  it("persists density, filters, sort, and collapsed panels", () => {
    const store = new Map<string, string>();
    vi.stubGlobal("window", {
      localStorage: {
        getItem: (k: string) => store.get(k) ?? null,
        setItem: (k: string, v: string) => {
          store.set(k, v);
        },
      },
    });
    const next = writeWorkspacePreferences({
      density: "dense",
      portfolioSort: "health",
      healthFilter: "Critical",
      confidenceFilter: "Low",
      agedWaitOnly: true,
      queueKind: "Approval",
      collapsedDecision: true,
      collapsedAttention: false,
      collapsedWaiting: true,
    });
    expect(next.density).toBe("dense");
    expect(readWorkspacePreferences().portfolioSort).toBe("health");
    expect(readWorkspacePreferences().collapsedDecision).toBe(true);
    expect(readWorkspacePreferences().agedWaitOnly).toBe(true);
  });
});
