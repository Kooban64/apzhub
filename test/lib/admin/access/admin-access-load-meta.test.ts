import { describe, expect, it } from "vitest";

import {
  getMockAccessData,
} from "@/lib/admin/mock-access-data";
import {
  isMockFallbackOrigin,
  stripAdminAccessMeta,
  type AdminAccessApiResponse,
} from "@/lib/admin/access/admin-access-load-meta";

describe("admin-access-load-meta", () => {
  it("stripAdminAccessMeta removes _meta", () => {
    const full: AdminAccessApiResponse = {
      ...getMockAccessData(),
      _meta: { origin: "mock_catalog" },
    };
    const stripped = stripAdminAccessMeta(full);
    expect("_meta" in stripped).toBe(false);
    expect(stripped.directory.users.length).toBeGreaterThan(0);
  });

  it("isMockFallbackOrigin is true only for fallback origins", () => {
    expect(isMockFallbackOrigin("mock_fallback_db_error")).toBe(true);
    expect(isMockFallbackOrigin("postgres")).toBe(false);
    expect(isMockFallbackOrigin("mock_catalog")).toBe(false);
  });
});
