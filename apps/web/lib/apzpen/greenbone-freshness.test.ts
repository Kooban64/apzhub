import { describe, expect, it, vi } from "vitest";

vi.mock("./provider-health", () => ({
  probeApzpenProviderHealth: vi.fn(async () => [
    {
      id: "greenbone",
      status: "ok",
      detail: "Reachable at http://127.0.0.1:9392 (HTTP 200)",
      checkedAt: "2026-08-15T08:00:00.000Z",
    },
  ]),
}));

import { getGreenboneFreshness } from "./greenbone-freshness";

describe("getGreenboneFreshness", () => {
  it("returns greenbone probe row shaped for bridge vaFreshness", async () => {
    const freshness = await getGreenboneFreshness();
    expect(freshness).toEqual({
      toolId: "greenbone",
      probedAt: "2026-08-15T08:00:00.000Z",
      status: "ok",
      detail: "Reachable at http://127.0.0.1:9392 (HTTP 200)",
    });
  });
});
