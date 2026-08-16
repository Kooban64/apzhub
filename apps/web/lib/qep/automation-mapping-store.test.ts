import { beforeEach, describe, expect, it } from "vitest";

import {
  findMapping,
  listMappings,
  resetAutomationMappingStoreForTests,
  upsertMapping,
} from "./automation-mapping-store";

describe("automation-mapping-store (SPR-APZQEP-220-C)", () => {
  beforeEach(() => {
    resetAutomationMappingStoreForTests();
  });

  it("upserts a mapping keyed by providerId+externalKey", () => {
    const row = upsertMapping({
      providerId: "playwright",
      externalKey: "suite/login.spec.ts",
      actorId: "user-1",
      owner: "qa-lead",
    });
    expect(row.mappingId).toMatch(/^map_/);
    expect(row.providerId).toBe("playwright");
    expect(row.externalKey).toBe("suite/login.spec.ts");
    expect(row.owner).toBe("qa-lead");
    expect(row.flaky).toBe(false);
    expect(row.stale).toBe(false);
    expect(listMappings()).toHaveLength(1);
  });

  it("updates owner and flags without creating a duplicate key", () => {
    upsertMapping({
      providerId: "vitest",
      externalKey: "unit/auth",
      actorId: "user-1",
    });
    const flaky = upsertMapping({
      providerId: "vitest",
      externalKey: "unit/auth",
      actorId: "user-2",
      flaky: true,
      owner: "owner-a",
    });
    expect(listMappings()).toHaveLength(1);
    expect(flaky.flaky).toBe(true);
    expect(flaky.owner).toBe("owner-a");
    expect(flaky.updatedBy).toBe("user-2");

    const cleared = upsertMapping({
      providerId: "vitest",
      externalKey: "unit/auth",
      actorId: "user-2",
      flaky: false,
      stale: true,
    });
    expect(cleared.flaky).toBe(false);
    expect(cleared.stale).toBe(true);
    expect(cleared.owner).toBe("owner-a");
  });

  it("keeps distinct rows when provider or externalKey differ", () => {
    upsertMapping({
      providerId: "cypress",
      externalKey: "e2e/a",
      actorId: "user-1",
    });
    upsertMapping({
      providerId: "cypress",
      externalKey: "e2e/b",
      actorId: "user-1",
    });
    upsertMapping({
      providerId: "k6",
      externalKey: "e2e/a",
      actorId: "user-1",
    });
    expect(listMappings()).toHaveLength(3);
    expect(findMapping("cypress", "e2e/a")?.providerId).toBe("cypress");
    expect(findMapping("missing", "x")).toBeNull();
  });

  it("persists optional notes and defectRef on upsert", () => {
    const row = upsertMapping({
      providerId: "accessibility",
      externalKey: "axe-home",
      actorId: "user-1",
      notes: "intermittent contrast",
      defectRef: "def-123",
    });
    expect(row.notes).toBe("intermittent contrast");
    expect(row.defectRef).toBe("def-123");
  });
});
