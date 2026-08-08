import { describe, expect, it } from "vitest";

import { DurableMap } from "./durable-map";
import { InMemoryOrchestrationDocumentStore } from "./in-memory-document-store";

describe("QX-PR-05 DurableMap", () => {
  it("write-through persists and hydrates after restart simulation", async () => {
    const store = new InMemoryOrchestrationDocumentStore();
    const mapA = new DurableMap<{ id: string; tenantId: string; state: string }>(
      "flow_instance",
      store,
      (v) => ({ tenantId: v.tenantId, status: v.state }),
    );

    await mapA.set("inst_1", { id: "inst_1", tenantId: "t1", state: "ready" });
    expect(mapA.get("inst_1")?.state).toBe("ready");

    const mapB = new DurableMap<{ id: string; tenantId: string; state: string }>(
      "flow_instance",
      store,
      (v) => ({ tenantId: v.tenantId, status: v.state }),
    );
    await mapB.hydrate();
    expect(mapB.get("inst_1")).toEqual({
      id: "inst_1",
      tenantId: "t1",
      state: "ready",
    });
    expect(mapB.size).toBe(1);
  });

  it("seed does not write to SoR", async () => {
    const store = new InMemoryOrchestrationDocumentStore();
    const map = new DurableMap<{ id: string; tenantId: string }>(
      "decision_package",
      store,
      (v) => ({ tenantId: v.tenantId }),
    );
    map.seed("seed_1", { id: "seed_1", tenantId: "t1" });
    expect(map.get("seed_1")).toBeTruthy();
    expect((await store.listByKind("decision_package")).length).toBe(0);
  });
});
