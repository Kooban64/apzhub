import { describe, expect, it } from "vitest";

import type { EvidenceDto } from "../dto/evidence-dto";
import {
  filterEvidenceByReadAcl,
  paginateEvidenceEnumeration,
  sortEvidenceEnumeration,
} from "./enumeration-acl";
import type { EvidenceSecurityGate } from "./security-gate";
import { allowDecision, denyDecision } from "./types";

function dto(
  overrides: Partial<EvidenceDto> & Pick<EvidenceDto, "id" | "tenantId">,
): EvidenceDto {
  return {
    projectId: "p1",
    status: "captured",
    sourceKind: "manual_upload",
    sealed: false,
    legalHold: false,
    retentionClass: "standard",
    tags: [],
    version: 1,
    revision: 1,
    ownerId: "owner-1",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    availableActions: [],
    title: overrides.id,
    ...overrides,
  };
}

function gateWithAllowed(ids: ReadonlySet<string>): EvidenceSecurityGate {
  return {
    policy: {} as EvidenceSecurityGate["policy"],
    authorize: async () => undefined,
    evaluate: async (_ctx, _op, resource) =>
      resource?.evidenceId && ids.has(resource.evidenceId)
        ? allowDecision("acl_allow_grant")
        : denyDecision("no_matching_allow_grant"),
    evaluatePrincipal: async () => denyDecision("no_matching_allow_grant"),
  };
}

describe("APZQEP-120-S01 enumeration ACL helpers", () => {
  it("filters to ACL-visible items and drops cross-tenant rows", async () => {
    const items = [
      dto({ id: "ev-a", tenantId: "tenant-1" }),
      dto({ id: "ev-b", tenantId: "tenant-1" }),
      dto({ id: "ev-other", tenantId: "tenant-OTHER" }),
    ];
    const visible = await filterEvidenceByReadAcl(
      {
        tenantId: "tenant-1",
        userId: "reader-1",
        permissions: ["qep.evidence.read"],
      },
      gateWithAllowed(new Set(["ev-a"])),
      items,
    );
    expect(visible.map((item) => item.id)).toEqual(["ev-a"]);
  });

  it("admin short-circuits per-item evaluation within tenant", async () => {
    const items = [
      dto({ id: "ev-a", tenantId: "tenant-1" }),
      dto({ id: "ev-b", tenantId: "tenant-1" }),
      dto({ id: "ev-x", tenantId: "tenant-OTHER" }),
    ];
    let evaluateCalls = 0;
    const gate: EvidenceSecurityGate = {
      ...gateWithAllowed(new Set()),
      evaluate: async () => {
        evaluateCalls += 1;
        return denyDecision("should_not_run");
      },
    };
    const visible = await filterEvidenceByReadAcl(
      {
        tenantId: "tenant-1",
        userId: "admin-1",
        permissions: ["qep.evidence.admin"],
      },
      gate,
      items,
    );
    expect(evaluateCalls).toBe(0);
    expect(visible.map((item) => item.id)).toEqual(["ev-a", "ev-b"]);
  });

  it("sorts by title ascending and paginates with correct total", () => {
    const items = [
      dto({
        id: "ev-2",
        tenantId: "tenant-1",
        title: "bravo",
        createdAt: "2026-01-02T00:00:00.000Z",
      }),
      dto({
        id: "ev-1",
        tenantId: "tenant-1",
        title: "alpha",
        createdAt: "2026-01-01T00:00:00.000Z",
      }),
      dto({
        id: "ev-3",
        tenantId: "tenant-1",
        title: "charlie",
        createdAt: "2026-01-03T00:00:00.000Z",
      }),
    ];
    const sorted = sortEvidenceEnumeration(items, { sort: "title", order: "asc" });
    expect(sorted.map((item) => item.title)).toEqual(["alpha", "bravo", "charlie"]);

    const page = paginateEvidenceEnumeration(sorted, { limit: 2, offset: 1 });
    expect(page.total).toBe(3);
    expect(page.items.map((item) => item.id)).toEqual(["ev-2", "ev-3"]);
  });
});
