import { describe, expect, it } from "vitest";

import {
  computeBundleAssignmentIntents,
  computeServiceOverrideIntents,
  computeUserSuspendIntents,
  mergeBundleRoleMap,
} from "@/lib/provisioning/access-triggers";
import { getMockAccessData } from "@/lib/admin/mock-access-data";

describe("mergeBundleRoleMap", () => {
  it("picks stronger role when bundles overlap on a service", () => {
    const data = getMockAccessData();
    const m = mergeBundleRoleMap(["b-std", "b-core"], data.bundleDetailsById);
    expect(m.get("mail")?.roleId).toBe("r-mail-std");
  });
});

describe("computeBundleAssignmentIntents", () => {
  it("emits grant/repair when adding a richer bundle", () => {
    const data = getMockAccessData();
    const intents = computeBundleAssignmentIntents(data, "u-1002", ["b-core"], []);
    const byService = new Map(intents.map((i) => [i.serviceId, i]));
    expect(byService.get("drive")?.jobType).toBe("grant");
    expect(byService.get("mail")?.jobType).toBe("repair");
    expect(intents.every((i) => i.triggerSource === "bundle_assignment")).toBe(true);
  });
});

describe("computeServiceOverrideIntents", () => {
  it("queues a grant when setting an override role", () => {
    const data = getMockAccessData();
    const intents = computeServiceOverrideIntents(data, "u-1001", "mail", "viewer");
    expect(intents).toHaveLength(1);
    expect(intents[0]?.jobType).toBe("grant");
    expect(intents[0]?.desiredEffectiveRole).toBe("viewer");
    expect(intents[0]?.triggerSource).toBe("service_override");
  });
});

describe("computeUserSuspendIntents", () => {
  it("revokes each non-none service line", () => {
    const data = getMockAccessData();
    const intents = computeUserSuspendIntents(data, "u-1001");
    expect(intents.length).toBeGreaterThanOrEqual(2);
    expect(intents.every((i) => i.jobType === "revoke")).toBe(true);
    expect(intents.every((i) => i.triggerSource === "user_suspend")).toBe(true);
  });
});
