import type { PlatformGovernanceService } from "./platform-governance-service";

/** Default development tenant — aligned with platform-identity seed. */
export const DEFAULT_PLATFORM_TENANT_ID = "t0000001-0000-4000-8000-000000000001";

const DEFAULT_PRODUCTS = [
  {
    capabilityKey: "platform",
    capabilityType: "platform" as const,
    name: "APZHUB Platform",
    description: "Core platform shell and services",
    version: "1.0.0",
  },
  {
    capabilityKey: "law-platform",
    capabilityType: "product" as const,
    name: "Law Platform",
    description: "Legal practice management product",
    version: "1.0.0",
    dependencies: [{ dependsOnCapabilityKey: "platform", dependencyType: "required" as const }],
  },
];

const DEFAULT_MODULES = [
  {
    capabilityKey: "platform-administration",
    capabilityType: "module" as const,
    name: "Platform Operations",
    description: "Administration workspace",
    version: "0.1.0",
    dependencies: [{ dependsOnCapabilityKey: "platform", dependencyType: "required" as const }],
  },
  {
    capabilityKey: "platform-operations-personalisation",
    capabilityType: "module" as const,
    name: "Personalisation",
    description: "Platform personalisation operations",
    version: "0.1.0",
    dependencies: [{ dependsOnCapabilityKey: "platform-administration", dependencyType: "required" as const }],
  },
];

const DEFAULT_FEATURE_FLAGS = [
  {
    flagKey: "platform.operations.console",
    name: "Platform Operations Console",
    description: "Enable Platform Operations workspace sections",
    defaultEnabled: true,
  },
  {
    flagKey: "platform.personalisation.server-sync",
    name: "Server Personalisation Sync",
    description: "Persist preferences and workbench layout to platform storage",
    defaultEnabled: true,
  },
  {
    flagKey: "law.trust.accounting",
    name: "Trust Accounting",
    description: "Enable Trust Accounting capabilities in Law Platform",
    defaultEnabled: true,
  },
];

export async function seedDefaultGovernanceCatalog(service: PlatformGovernanceService): Promise<void> {
  for (const product of DEFAULT_PRODUCTS) {
    await service.capabilities.registerCapability(product);
    await service.governance.setEnablement({
      scopeType: "platform",
      targetType: "product",
      targetKey: product.capabilityKey,
      enabled: true,
    });
  }

  for (const module of DEFAULT_MODULES) {
    await service.capabilities.registerCapability(module);
    await service.governance.setEnablement({
      scopeType: "platform",
      targetType: "module",
      targetKey: module.capabilityKey,
      enabled: true,
    });
  }

  await service.governance.setEnablement({
    scopeType: "tenant",
    scopeKey: DEFAULT_PLATFORM_TENANT_ID,
    targetType: "product",
    targetKey: "law-platform",
    enabled: true,
  });

  for (const flag of DEFAULT_FEATURE_FLAGS) {
    await service.featureFlags.registerFlag(flag);
  }
}

export async function provisionDefaultGovernanceForTenant(input: {
  readonly tenantId: string;
  readonly productKeys?: readonly string[];
}): Promise<void> {
  const { getSharedGovernanceService } = await import("./index");
  const service = getSharedGovernanceService();

  await service.governance.setEnablement({
    scopeType: "tenant",
    scopeKey: input.tenantId,
    targetType: "product",
    targetKey: "platform",
    enabled: true,
  });

  for (const productKey of input.productKeys ?? ["law-platform"]) {
    await service.governance.setEnablement({
      scopeType: "tenant",
      scopeKey: input.tenantId,
      targetType: "product",
      targetKey: productKey,
      enabled: true,
    });

    await service.provisioning.provisionProduct({
      scopeType: "tenant",
      scopeKey: input.tenantId,
      targetType: "product",
      targetKey: productKey,
    });
  }
}
