import { describe, expect, it } from "vitest";

import {
  computeEffectiveServiceAccessByServiceId,
  mergeBundleRoleMap,
  roleRank,
} from "@/lib/access/effective-access";
import { getMockAccessData } from "@/lib/admin/mock-access-data";

describe("roleRank", () => {
  it("ranks admin above viewer", () => {
    expect(roleRank("r-x-admin", "Admin")).toBeGreaterThan(roleRank("r-x-view", "Viewer"));
  });
});

describe("computeEffectiveServiceAccessByServiceId", () => {
  it("applies override on top of bundle baseline", () => {
    const data = getMockAccessData();
    const overrideByServiceId = new Map<string, string>([["mail", "r-mail-view"]]);
    const m = computeEffectiveServiceAccessByServiceId({
      bundleIds: ["b-core"],
      bundleDetailsById: data.bundleDetailsById,
      serviceDetailsById: data.serviceDetailsById,
      serviceIds: ["mail", "calendar", "drive"],
      overrideByServiceId,
      suspended: false,
    });
    expect(m.get("mail")?.source).toBe("bundle_plus_override");
    expect(m.get("mail")?.roleId).toBe("r-mail-view");
  });

  it("returns null for all services when suspended", () => {
    const data = getMockAccessData();
    const m = computeEffectiveServiceAccessByServiceId({
      bundleIds: ["b-core"],
      bundleDetailsById: data.bundleDetailsById,
      serviceDetailsById: data.serviceDetailsById,
      serviceIds: ["mail"],
      overrideByServiceId: new Map(),
      suspended: true,
    });
    expect(m.get("mail")).toBeNull();
  });
});

describe("mergeBundleRoleMap (via effective-access)", () => {
  it("matches bundle overlap expectations used by triggers", () => {
    const data = getMockAccessData();
    const m = mergeBundleRoleMap(["b-std", "b-core"], data.bundleDetailsById);
    expect(m.get("mail")?.roleId).toBe("r-mail-std");
  });
});
