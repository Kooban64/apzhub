import { describe, expect, it } from "vitest";

import { createTestPlan } from "../../domain/test-plan/test-plan";
import { matchesListFilters, toStoredTestPlan } from "./plan-mapper";

const TENANT = "tenant_mapper";
const ACTOR = "user_mapper";
const NOW = "2026-07-27T12:00:00.000Z";

function stored(overrides: Record<string, unknown> = {}) {
  return toStoredTestPlan(
    createTestPlan({
      id: "tpl_mapper_1",
      tenantId: TENANT,
      number: "TP-MAP-001",
      title: "Mapper plan",
      ownerId: ACTOR,
      scope: { class: "release" },
      objective: "Mapper objective",
      priority: "high",
      createdAt: NOW,
      createdBy: ACTOR,
      correlationId: "corr_mapper",
      ...overrides,
    }),
  );
}

describe("plan-mapper", () => {
  it("maps aggregates to stored plans without uncommitted events", () => {
    expect(stored().uncommittedEvents).toEqual([]);
  });

  it("matches list filters for status, owner, priority, and plan type", () => {
    const row = stored({ priority: "high" });

    expect(matchesListFilters(row, { ownerId: ACTOR })).toBe(true);
    expect(matchesListFilters(row, { ownerId: "someone_else" })).toBe(false);
    expect(matchesListFilters(row, { priority: "high" })).toBe(true);
    expect(matchesListFilters(row, { priority: "low" })).toBe(false);
    expect(matchesListFilters(row, { planType: "release" })).toBe(true);
    expect(matchesListFilters(row, { planType: "sprint" })).toBe(false);
    expect(matchesListFilters(row, { status: "draft" })).toBe(true);
  });

  it("matches text queries against title/number/objective and treats blank queries as pass-through", () => {
    const row = stored();
    expect(matchesListFilters(row, { query: "Mapper plan" })).toBe(true);
    expect(matchesListFilters(row, { query: "TP-MAP-001" })).toBe(true);
    expect(matchesListFilters(row, { query: "missing" })).toBe(false);
    expect(matchesListFilters(row, { query: "   " })).toBe(true);
  });

  it("excludes terminal statuses by default unless explicitly requested", () => {
    const cancelled = { ...stored(), status: "cancelled" as const };
    expect(matchesListFilters(cancelled, {})).toBe(false);
    expect(matchesListFilters(cancelled, { includeArchived: true })).toBe(true);
    expect(matchesListFilters(cancelled, { status: "cancelled" })).toBe(true);
  });
});
