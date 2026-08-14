import { describe, expect, it } from "vitest";

import { filterMemoryObjects } from "./filter-memory-objects";

describe("filterMemoryObjects", () => {
  const items = [
    {
      title: "Handover lesson",
      summary: "Release handover checklist",
      status: "approved",
      owner: "qa",
      tags: ["handover", "release"],
      kind: "lesson",
    },
    {
      title: "Security standard",
      summary: "TLS everywhere",
      status: "draft",
      owner: "sec",
      tags: ["security"],
      kind: "standard",
    },
  ] as const;

  it("returns all items for empty query", () => {
    expect(filterMemoryObjects(items, "  ")).toHaveLength(2);
  });

  it("matches title, tags, and status", () => {
    expect(filterMemoryObjects(items, "handover")).toHaveLength(1);
    expect(filterMemoryObjects(items, "draft")[0]?.title).toBe("Security standard");
    expect(filterMemoryObjects(items, "TLS")).toHaveLength(1);
  });
});
