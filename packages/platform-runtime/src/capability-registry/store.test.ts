import { describe, expect, it } from "vitest";

import { CapabilityRegistryStore } from "./store";

describe("CapabilityRegistryStore", () => {
  const sampleRecord = {
    id: "sample",
    name: "Sample",
    kind: "component" as const,
    version: "1.0.0",
    lifecycleState: "registered" as const,
    healthState: "unknown" as const,
    dependencies: {
      platform: [],
      services: [],
      integrations: [],
      modules: [],
      all: [],
    },
    metadata: {},
    manifest: {
      manifestSchemaVersion: "1.0" as const,
      id: "sample",
      name: "Sample",
      version: "1.0.0",
      kind: "component" as const,
      metadata: {},
      component: { theme: { supportsDarkMode: true } },
    },
    registrationTimestamp: "2026-01-01T00:00:00.000Z",
    platformVersionCompatibility: undefined,
    runtimeStatus: "registered" as const,
  };

  it("inserts after a preserved order anchor", () => {
    const store = new CapabilityRegistryStore();
    store.insert({ ...sampleRecord, id: "first" });
    store.insert({ ...sampleRecord, id: "third" });
    store.insert({ ...sampleRecord, id: "second" }, "first");

    expect(store.getRegistrationOrder()).toEqual(["first", "second", "third"]);
  });

  it("returns sorted records by kind", () => {
    const store = new CapabilityRegistryStore();
    store.insert({ ...sampleRecord, id: "b", kind: "module" });
    store.insert({ ...sampleRecord, id: "a", kind: "module" });

    expect(store.getByKind("module").map((r) => r.id)).toEqual(["a", "b"]);
    expect(store.getByKind("service")).toEqual([]);
  });
});
