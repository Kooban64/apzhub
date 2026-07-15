import { describe, expect, it } from "vitest";

import { createInMemoryGovernanceService } from "./index";

describe("Governance repository parity (in-memory contract)", () => {
  it("registers capabilities, enablements, flags, and provisioning records", async () => {
    const { service } = createInMemoryGovernanceService();
    await new Promise((resolve) => setTimeout(resolve, 0));

    const capabilities = await service.capabilities.listCapabilities();
    expect(capabilities.length).toBeGreaterThan(0);

    const enablement = await service.governance.setEnablement({
      scopeType: "tenant",
      scopeKey: "tenant-parity",
      targetType: "product",
      targetKey: "law-platform",
      enabled: true,
    });
    expect(enablement.enabled).toBe(true);

    const evaluation = await service.featureFlags.evaluateFlag("law.trust.accounting", {
      tenantId: "tenant-parity",
      productKey: "law-platform",
    });
    expect(evaluation.enabled).toBe(true);

    const record = await service.productProvisioning.provisionProduct({
      scopeType: "tenant",
      scopeKey: "tenant-parity",
      targetType: "product",
      targetKey: "law-platform",
    });
    expect(record.status).toBe("completed");
  });
});
