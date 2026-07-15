/** Capability startup dependency sequence (PRH-009). Lower order starts first. */
export interface LifecycleCapabilityRegistration {
  readonly capabilityId: string;
  readonly name: string;
  readonly owner: string;
  readonly version: string;
  readonly minPlatformVersion?: string;
  readonly dependencies: readonly string[];
  readonly sequenceOrder: number;
}

/** Product registrations — products participate; platform owns lifecycle. */
export interface LifecycleProductRegistration {
  readonly productId: string;
  readonly name: string;
  readonly version: string;
  readonly minPlatformVersion?: string;
  readonly dependencies: readonly string[];
  readonly sequenceOrder: number;
}

export const LIFECYCLE_CAPABILITY_REGISTRATIONS: readonly LifecycleCapabilityRegistration[] = [
  { capabilityId: "platform.configuration", name: "Platform Configuration", owner: "@apzhub/config", version: "0.1.0", dependencies: [], sequenceOrder: 10 },
  { capabilityId: "platform.persistence", name: "Platform Persistence", owner: "@apzhub/config", version: "0.1.0", dependencies: ["platform.configuration"], sequenceOrder: 20 },
  { capabilityId: "platform.runtime", name: "Platform Runtime", owner: "@apzhub/platform-runtime", version: "0.1.0", dependencies: [], sequenceOrder: 30 },
  { capabilityId: "platform.bootstrap", name: "Platform Bootstrap", owner: "@apzhub/platform-bootstrap", version: "0.1.0", dependencies: ["platform.runtime"], sequenceOrder: 40 },
  { capabilityId: "platform.identity", name: "Platform Identity", owner: "@apzhub/platform-identity", version: "0.1.0", dependencies: ["platform.persistence"], sequenceOrder: 50 },
  { capabilityId: "platform.authorization", name: "Platform Authorization", owner: "@apzhub/platform-authorization", version: "0.1.0", dependencies: ["platform.identity"], sequenceOrder: 60 },
  { capabilityId: "platform.personalisation", name: "Platform Personalisation", owner: "@apzhub/platform-personalisation", version: "0.1.0", dependencies: ["platform.persistence"], sequenceOrder: 70 },
  { capabilityId: "platform.governance", name: "Platform Governance", owner: "@apzhub/platform-governance", version: "0.1.0", dependencies: ["platform.persistence"], sequenceOrder: 80 },
  { capabilityId: "platform.security", name: "Platform Security", owner: "@apzhub/platform-security", version: "0.1.0", dependencies: ["platform.configuration"], sequenceOrder: 90 },
  { capabilityId: "platform.traffic-governance", name: "Traffic Governance", owner: "@apzhub/platform-security", version: "0.1.0", dependencies: ["platform.security"], sequenceOrder: 100 },
  { capabilityId: "platform.session-security", name: "Session Security", owner: "@apzhub/auth", version: "0.1.0", dependencies: ["platform.identity", "platform.security"], sequenceOrder: 110 },
  { capabilityId: "platform.tenant-isolation", name: "Tenant Isolation", owner: "@apzhub/platform-identity", version: "0.1.0", dependencies: ["platform.identity", "platform.persistence"], sequenceOrder: 120 },
  { capabilityId: "platform.workbench", name: "Workbench Framework", owner: "@apzhub/workbench-framework", version: "0.1.0", dependencies: ["platform.runtime"], sequenceOrder: 130 },
  { capabilityId: "platform.api-framework", name: "API Framework", owner: "apps/web/lib/api", version: "0.1.0", dependencies: ["platform.security", "platform.authorization"], sequenceOrder: 140 },
  { capabilityId: "platform.operations", name: "Operations Control Plane", owner: "@apzhub/platform-operations", version: "0.1.0", dependencies: ["platform.bootstrap", "platform.security"], sequenceOrder: 150 },
  { capabilityId: "platform.provisioning", name: "Platform Provisioning", owner: "@apzhub/platform-identity", version: "0.1.0", minPlatformVersion: ">=0.1.0", dependencies: ["platform.identity"], sequenceOrder: 160 },
] as const;

export const LIFECYCLE_PRODUCT_REGISTRATIONS: readonly LifecycleProductRegistration[] = [
  {
    productId: "law-platform",
    name: "Law Platform",
    version: "1.0.0",
    minPlatformVersion: ">=0.1.0",
    dependencies: ["platform.persistence", "platform.tenant-isolation", "platform.api-framework"],
    sequenceOrder: 200,
  },
  {
    productId: "trust-accounting",
    name: "Trust Accounting",
    version: "0.1.0",
    minPlatformVersion: ">=0.1.0",
    dependencies: ["law-platform", "platform.persistence"],
    sequenceOrder: 210,
  },
] as const;

export function getStartupSequence(): readonly string[] {
  return [...LIFECYCLE_CAPABILITY_REGISTRATIONS, ...LIFECYCLE_PRODUCT_REGISTRATIONS]
    .sort((left, right) => left.sequenceOrder - right.sequenceOrder)
    .map((entry) => "capabilityId" in entry ? entry.capabilityId : entry.productId);
}
