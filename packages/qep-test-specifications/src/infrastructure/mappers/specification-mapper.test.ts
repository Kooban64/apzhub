import { describe, expect, it } from "vitest";

import { createTestSpecification } from "../../domain/test-specification/test-specification";
import { matchesListFilters, toStoredTestSpecification } from "./specification-mapper";

const TENANT = "tenant_mapper";
const ACTOR = "user_mapper";
const NOW = "2026-07-26T12:00:00.000Z";

function stored(overrides: Record<string, unknown> = {}) {
  return toStoredTestSpecification(
    createTestSpecification({
      id: "tsp_mapper_1",
      tenantId: TENANT,
      number: "TS-MAP-001",
      title: "Mapper specification",
      description: "Desc",
      objective: "Obj",
      scope: "Scope",
      type: "functional",
      classification: "standard",
      owner: ACTOR,
      author: ACTOR,
      priority: "high",
      tags: ["alpha"],
      createdAt: NOW,
      createdBy: ACTOR,
      correlationId: "corr_mapper",
      ...overrides,
    }),
  );
}

describe("specification-mapper", () => {
  it("maps aggregates to stored specifications without domain events", () => {
    const aggregate = createTestSpecification({
      id: "tsp_mapper_events",
      tenantId: TENANT,
      number: "TS-MAP-002",
      title: "Events stripped",
      description: "Desc",
      objective: "Obj",
      scope: "Scope",
      type: "functional",
      classification: "standard",
      owner: ACTOR,
      author: ACTOR,
      createdAt: NOW,
      createdBy: ACTOR,
      correlationId: "corr_mapper",
    });
    expect(toStoredTestSpecification(aggregate).domainEvents).toEqual([]);
  });

  it("matches list filters for classification, priority, and authoritative flags", () => {
    const row = stored({ priority: "high" });

    expect(matchesListFilters(row, { classification: "standard" })).toBe(true);
    expect(matchesListFilters(row, { classification: "restricted" })).toBe(false);
    expect(matchesListFilters(row, { priority: "high" })).toBe(true);
    expect(matchesListFilters(row, { priority: "low" })).toBe(false);
    expect(matchesListFilters(row, { isAuthoritative: false })).toBe(true);
    expect(matchesListFilters(row, { isAuthoritative: true })).toBe(false);
  });

  it("matches text queries and treats blank queries as pass-through", () => {
    const row = stored();
    expect(matchesListFilters(row, { query: "alpha" })).toBe(true);
    expect(matchesListFilters(row, { query: "missing" })).toBe(false);
    expect(matchesListFilters(row, { query: "   " })).toBe(true);
  });
});
