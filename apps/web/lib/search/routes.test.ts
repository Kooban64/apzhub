import { describe, expect, it } from "vitest";

import {
  isSearchRoute,
  resolveSearchSection,
  SEARCH_BASE,
  searchSectionPath,
} from "./routes";

describe("search routes helpers", () => {
  it("detects and resolves sections", () => {
    expect(isSearchRoute(SEARCH_BASE)).toBe(true);
    expect(isSearchRoute(`${SEARCH_BASE}/query`)).toBe(true);
    expect(isSearchRoute("/workspace/documents")).toBe(false);
    expect(resolveSearchSection(SEARCH_BASE)).toBe("overview");
    expect(resolveSearchSection(`${SEARCH_BASE}/`)).toBe("overview");
    expect(resolveSearchSection(`${SEARCH_BASE}/providers`)).toBe("providers");
    expect(resolveSearchSection(`${SEARCH_BASE}/publication`)).toBe("publication");
    expect(resolveSearchSection(`${SEARCH_BASE}/unknown`)).toBe("overview");
    expect(searchSectionPath()).toBe(`${SEARCH_BASE}/overview`);
    expect(searchSectionPath("overview")).toBe(`${SEARCH_BASE}/overview`);
    expect(searchSectionPath("query")).toBe(`${SEARCH_BASE}/query`);
    expect(searchSectionPath("publication")).toBe(`${SEARCH_BASE}/publication`);
  });
});
