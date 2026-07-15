import { describe, expect, it } from "vitest";

import { createInMemoryGovernanceService, resetSharedGovernanceService } from "./index";

describe("PlatformGovernanceService", () => {
  it("evaluates feature flags with scope precedence", async () => {
    resetSharedGovernanceService();
    const { service } = createInMemoryGovernanceService();
    await new Promise((resolve) => setTimeout(resolve, 0));

    await service.featureFlags.setOverride({
      flagKey: "law.trust.accounting",
      scopeType: "tenant",
      scopeKey: "tenant-a",
      enabled: false,
    });

    const disabled = await service.featureFlags.evaluateFlag("law.trust.accounting", {
      tenantId: "tenant-a",
      productKey: "law-platform",
    });
    expect(disabled.enabled).toBe(false);
    expect(disabled.source).toBe("tenant");

    const enabled = await service.featureFlags.evaluateFlag("law.trust.accounting", {
      tenantId: "tenant-b",
      productKey: "law-platform",
    });
    expect(enabled.enabled).toBe(true);
  });

  it("returns governance diagnostics", async () => {
    const { service } = createInMemoryGovernanceService();
    await new Promise((resolve) => setTimeout(resolve, 0));
    const diagnostics = await service.getDiagnostics();
    expect(diagnostics.capabilityCount).toBeGreaterThan(0);
    expect(diagnostics.featureFlagCount).toBeGreaterThan(0);
  });
});
