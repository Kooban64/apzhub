import { describe, expect, it } from "vitest";

import { APE_CATALOGUE, listFoundationApes } from "./ape-catalogue";

describe("APE catalogue (PE-P1-02)", () => {
  it("lists foundation engines and defers AI/RAG", () => {
    const foundation = listFoundationApes();
    expect(foundation.every((e) => e.foundationScope)).toBe(true);
    expect(foundation.some((e) => e.id === "ape-audit")).toBe(true);
    expect(foundation.some((e) => e.id === "ape-ai")).toBe(false);
    const ai = APE_CATALOGUE.find((e) => e.id === "ape-ai");
    const rag = APE_CATALOGUE.find((e) => e.id === "ape-rag");
    expect(ai?.maturity).toBe("deferred");
    expect(rag?.maturity).toBe("deferred");
  });
});
