import { describe, expect, it } from "vitest";

import {
  assertMaxAccessMapComplete,
  listCatalogServiceIds,
  MAX_ROLE_BY_SERVICE_ID,
} from "@/lib/dev/catalog-max-access";

describe("catalog-max-access", () => {
  it("assertMaxAccessMapComplete does not throw", () => {
    expect(() => assertMaxAccessMapComplete()).not.toThrow();
  });

  it("defines a max role token for every mock catalog service", () => {
    for (const id of listCatalogServiceIds()) {
      expect(MAX_ROLE_BY_SERVICE_ID[id], id).toBeTruthy();
    }
  });
});
