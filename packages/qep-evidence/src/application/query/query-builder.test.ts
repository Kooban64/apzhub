import { describe, expect, it } from "vitest";

import { EvidenceApplicationValidationError } from "../../shared/errors";
import type { EvidenceDto } from "../dto/evidence-dto";
import { createEvidenceQueryBuilder, EVIDENCE_QUERY_MAX_LIMIT } from "./query-builder";

function dto(overrides: Partial<EvidenceDto> & Pick<EvidenceDto, "id">): EvidenceDto {
  return {
    tenantId: "tenant-1",
    projectId: "p1",
    status: "captured",
    sourceKind: "manual_upload",
    sealed: false,
    legalHold: false,
    retentionClass: "standard",
    tags: ["alpha"],
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

describe("APZQEP-120-S02 EvidenceQueryBuilder", () => {
  const builder = createEvidenceQueryBuilder();

  it("builds a normalised enumeration plan with defaults", () => {
    const plan = builder.buildEnumerationPlan({
      filter: { projectId: "proj-1" },
    });
    expect(plan.sort).toBe("createdAt");
    expect(plan.order).toBe("desc");
    expect(plan.page.offset).toBe(0);
    expect(plan.filter.projectId).toBe("proj-1");
  });

  it("rejects unsafe identifiers and unknown sort", () => {
    expect(() =>
      builder.buildEnumerationPlan({ filter: { projectId: "a;drop" } }),
    ).toThrow(EvidenceApplicationValidationError);

    expect(() => builder.buildEnumerationPlan({ sort: "password" })).toThrow(
      EvidenceApplicationValidationError,
    );

    expect(() =>
      builder.buildEnumerationPlan({ page: { limit: EVIDENCE_QUERY_MAX_LIMIT + 1 } }),
    ).toThrow(EvidenceApplicationValidationError);

    expect(() => builder.buildEnumerationPlan({ page: { offset: -1 } })).toThrow(
      EvidenceApplicationValidationError,
    );
  });

  it("applies text search, structural filters, sort, and pagination", () => {
    const items = [
      dto({
        id: "ev-1",
        title: "needle-alpha",
        projectId: "p1",
        createdAt: "2026-01-02T00:00:00.000Z",
      }),
      dto({
        id: "ev-2",
        title: "other",
        projectId: "p1",
        createdAt: "2026-01-01T00:00:00.000Z",
      }),
      dto({
        id: "ev-3",
        title: "needle-bravo",
        projectId: "p2",
        createdAt: "2026-01-03T00:00:00.000Z",
      }),
    ];

    const searched = builder.applyTextSearch(items, "needle");
    expect(searched.map((item) => item.id)).toEqual(["ev-1", "ev-3"]);

    const filtered = builder.applyStructuralFilters(searched, { projectId: "p1" });
    expect(filtered.map((item) => item.id)).toEqual(["ev-1"]);

    const sorted = builder.sort(items, "title", "asc");
    expect(sorted.map((item) => item.title)).toEqual([
      "needle-alpha",
      "needle-bravo",
      "other",
    ]);

    const page = builder.paginate(sorted, { limit: 2, offset: 1 });
    expect(page.total).toBe(3);
    expect(page.items).toHaveLength(2);
  });
});
