import { describe, expect, it } from "vitest";

import { buildProvisioningIdempotencyKey } from "@/lib/provisioning/idempotency/key";

describe("buildProvisioningIdempotencyKey", () => {
  it("is stable for the same inputs", () => {
    const a = buildProvisioningIdempotencyKey({
      userId: "u-1",
      serviceId: "mail",
      jobType: "grant",
      desiredEffectiveRole: "editor",
      triggerSource: "bundle_assignment",
    });
    const b = buildProvisioningIdempotencyKey({
      userId: "u-1",
      serviceId: "mail",
      jobType: "grant",
      desiredEffectiveRole: "editor",
      triggerSource: "bundle_assignment",
    });
    expect(a).toBe(b);
  });

  it("differs when role or trigger changes", () => {
    const base = {
      userId: "u-1",
      serviceId: "mail",
      jobType: "grant" as const,
      desiredEffectiveRole: "editor",
      triggerSource: "bundle_assignment" as const,
    };
    const k1 = buildProvisioningIdempotencyKey(base);
    const k2 = buildProvisioningIdempotencyKey({ ...base, desiredEffectiveRole: "viewer" });
    const k3 = buildProvisioningIdempotencyKey({ ...base, triggerSource: "manual_retry" });
    expect(k1).not.toBe(k2);
    expect(k1).not.toBe(k3);
  });
});
