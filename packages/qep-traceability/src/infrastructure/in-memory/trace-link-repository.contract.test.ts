import { describe, expect, it } from "vitest";

import { createTraceLink, updateTraceRationale } from "../../domain/trace-link/trace-link";
import { TraceConflictError, TraceNotFoundError, TraceRevisionConflictError } from "../../shared/errors";
import {
  createEmptyTraceLinkStore,
  createInMemoryTraceLinkRepository,
  createInMemoryTraceTaxonomyRepository,
} from "./trace-link-repository";

const TENANT = "tenant_trace_contract";
const ACTOR = "user_trace_contract";
const CORR = "corr_trace_contract";
const NOW = "2026-07-26T10:00:00.000Z";

function draftTrace(id: string, sourceId = "req_1", targetId = "tc_1") {
  return createTraceLink({
    id,
    tenantId: TENANT,
    type: "requirement_tested_by",
    source: { kind: "requirement", artefactId: sourceId },
    target: { kind: "test_case", artefactId: targetId },
    authority: { kind: "user", actorId: ACTOR },
    provenance: { actorId: ACTOR, correlationId: CORR },
    createdAt: NOW,
    createdBy: ACTOR,
    correlationId: CORR,
  });
}

describe("TraceLinkRepository contract (in-memory)", () => {
  it("implements create -> get -> save with optimistic revision", async () => {
    const store = createEmptyTraceLinkStore();
    const repo = createInMemoryTraceLinkRepository(store);

    const created = await repo.create(draftTrace("trl_contract_1", "req_a1", "tc_a1"));
    expect(created.lifecycleState).toBe("draft");
    expect(created.revision).toBe(1);
    expect(await repo.get(TENANT, created.id)).toEqual(created);
    expect(await repo.exists(TENANT, created.id)).toBe(true);

    const listed = await repo.list(TENANT, { sourceKind: "requirement", sourceArtefactId: "req_a1" });
    expect(listed).toHaveLength(1);

    const mutated = updateTraceRationale(created, "Updated contract rationale", "2026-07-26T10:05:00.000Z", ACTOR);
    const saved = await repo.save(mutated, created.revision);
    expect(saved.revision).toBe(2);
    expect(saved.rationale).toBe("Updated contract rationale");
    expect((await repo.listHistory(TENANT, created.id)).length).toBeGreaterThan(1);
  });

  it("rejects duplicate active Trace Links for the same type, endpoints, and scope", async () => {
    const store = createEmptyTraceLinkStore();
    const repo = createInMemoryTraceLinkRepository(store);
    const first = draftTrace("trl_contract_dup_a", "req_dup_1", "tc_dup_1");
    await repo.create(first);

    const duplicate = draftTrace("trl_contract_dup_b", "req_dup_1", "tc_dup_1");
    await expect(repo.create(duplicate)).rejects.toThrow(TraceConflictError);
  });

  it("throws revision conflict and not-found for invalid saves", async () => {
    const store = createEmptyTraceLinkStore();
    const repo = createInMemoryTraceLinkRepository(store);
    const created = await repo.create(draftTrace("trl_contract_rev", "req_rev_1", "tc_rev_1"));

    const mutated = updateTraceRationale(created, "Updated rationale", "2026-07-26T10:06:00.000Z", ACTOR);

    await expect(repo.save(mutated, 99)).rejects.toThrow(TraceRevisionConflictError);
    await expect(
      repo.save({ ...mutated, id: "trl_missing" as typeof created.id }, 1),
    ).rejects.toThrow(TraceNotFoundError);
  });

  it("lists edge facts and supports listEdgeFacts exclusion / type filters", async () => {
    const store = createEmptyTraceLinkStore();
    const repo = createInMemoryTraceLinkRepository(store);
    const a = await repo.create(draftTrace("trl_edge_a", "req_edge_1", "tc_edge_1"));
    await repo.create(draftTrace("trl_edge_b", "req_edge_2", "tc_edge_2"));

    const all = await repo.listEdgeFacts(TENANT);
    expect(all).toHaveLength(2);

    const excluded = await repo.listEdgeFacts(TENANT, { excludeTraceId: a.id });
    expect(excluded).toHaveLength(1);
    expect(excluded[0]?.traceId).not.toBe(a.id);

    const byType = await repo.listEdgeFacts(TENANT, { types: ["requirement_tested_by"] });
    expect(byType).toHaveLength(2);
  });

  it("seeds and lists normative taxonomy per tenant", async () => {
    const store = createEmptyTraceLinkStore();
    const taxonomy = createInMemoryTraceTaxonomyRepository(store);
    await taxonomy.ensureSeeded(TENANT);
    const rows = await taxonomy.list(TENANT);
    expect(rows.some((row) => row.type === "requirement_tested_by")).toBe(true);
    expect(await taxonomy.get(TENANT, "requirement_specified_by")).not.toBeNull();
  });
});
