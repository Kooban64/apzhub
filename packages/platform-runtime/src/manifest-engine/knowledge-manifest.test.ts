import { describe, expect, it } from "vitest";

import {
  collectKnowledgeSourceManifests,
  hasKnowledgeSources,
  knowledgeBlockSchema,
} from "./schemas/knowledge";

describe("knowledge manifest schema", () => {
  const validSource = {
    id: "example.module.search",
    label: "Example Search",
    kind: "registry-projection" as const,
    tier: "T0" as const,
    priority: 50,
    provides: ["custom" as const],
  };

  it("accepts valid knowledge.sources block", () => {
    const parsed = knowledgeBlockSchema.parse({
      sources: [validSource],
    });

    expect(collectKnowledgeSourceManifests(parsed)).toHaveLength(1);
  });

  it("rejects invalid knowledge source id", () => {
    expect(() =>
      knowledgeBlockSchema.parse({
        sources: [{ ...validSource, id: "Invalid_ID" }],
      }),
    ).toThrow();
  });

  it("rejects empty provides array", () => {
    expect(() =>
      knowledgeBlockSchema.parse({
        sources: [{ ...validSource, provides: [] }],
      }),
    ).toThrow();
  });

  it("detects manifests with knowledge sources", () => {
    expect(
      hasKnowledgeSources({
        knowledge: { sources: [validSource] },
      }),
    ).toBe(true);
    expect(hasKnowledgeSources({ knowledge: { sources: [] } })).toBe(false);
    expect(hasKnowledgeSources({})).toBe(false);
  });
});
