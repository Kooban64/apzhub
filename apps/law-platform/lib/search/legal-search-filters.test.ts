import { describe, expect, it } from "vitest";

import {
  hasActiveLegalSearchFilters,
  mergeLegalSearchScope,
  normalizeLegalSearchFilters,
  parseLegalSearchFiltersFromSearchParams,
} from "./legal-search-filters";

describe("legal search filters", () => {
  it("normalizes and detects active filters", () => {
    const filters = normalizeLegalSearchFilters({
      entityType: "client",
      matterId: "matter-1",
      status: "open",
    });

    expect(hasActiveLegalSearchFilters(filters)).toBe(true);
    expect(hasActiveLegalSearchFilters({ entityType: "all" })).toBe(false);
  });

  it("parses search params", () => {
    const params = new URLSearchParams(
      "entity=client&matterId=m1&clientId=c1&status=open&dateFrom=2026-01-01&scopeMatterId=m1",
    );

    expect(parseLegalSearchFiltersFromSearchParams(params)).toEqual({
      entityType: "client",
      matterId: "m1",
      clientId: "c1",
      status: "open",
      dateFrom: "2026-01-01",
      scopeMatterId: "m1",
    });
  });

  it("merges context scope into filters", () => {
    expect(
      mergeLegalSearchScope({}, { matterId: "m1000001-0001-4000-8000-000000000001" }),
    ).toEqual({
      scopeMatterId: "m1000001-0001-4000-8000-000000000001",
      matterId: "m1000001-0001-4000-8000-000000000001",
    });
  });
});
