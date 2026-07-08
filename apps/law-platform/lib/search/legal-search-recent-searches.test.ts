import { beforeEach, describe, expect, it } from "vitest";

import {
  getLegalSearchRecentSearches,
  resetLegalSearchRecentSearches,
} from "./legal-search-recent-searches";

describe("legal search recent searches", () => {
  beforeEach(() => {
    resetLegalSearchRecentSearches();
  });

  it("stores recent searches in session memory only", () => {
    const store = getLegalSearchRecentSearches();
    store.record({
      query: "Harbourview",
      filters: {},
      resultCount: 3,
      surface: "page",
    });
    store.record({
      query: "Vasquez",
      filters: { entityType: "matter" },
      resultCount: 1,
      surface: "palette",
    });
    store.record({
      query: "Harbourview",
      filters: {},
      resultCount: 4,
      surface: "page",
    });

    const entries = store.list();
    expect(entries).toHaveLength(2);
    expect(entries[0]?.query).toBe("Harbourview");
    expect(entries[0]?.resultCount).toBe(4);
    expect(entries[1]?.surface).toBe("palette");
  });
});
