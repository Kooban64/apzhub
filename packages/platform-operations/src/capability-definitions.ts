import type { CapabilityMaturityLevel } from "./types";

export interface CapabilityDefinition {
  readonly capabilityId: string;
  readonly name: string;
  readonly owner: string;
  readonly version: string;
  readonly maturityLevel: CapabilityMaturityLevel;
  readonly dependencies: readonly string[];
}

/** Canonical platform capability registry for operations control plane (PRH-008). */
export const PLATFORM_CAPABILITY_DEFINITIONS: readonly CapabilityDefinition[] = [
  {
    capabilityId: "platform.runtime",
    name: "Platform Runtime",
    owner: "@apzhub/platform-runtime",
    version: "0.1.0",
    maturityLevel: "production",
    dependencies: [],
  },
  {
    capabilityId: "platform.bootstrap",
    name: "Platform Bootstrap",
    owner: "@apzhub/platform-bootstrap",
    version: "0.1.0",
    maturityLevel: "production",
    dependencies: ["platform.runtime"],
  },
  {
    capabilityId: "platform.identity",
    name: "Platform Identity",
    owner: "@apzhub/platform-identity",
    version: "0.1.0",
    maturityLevel: "operational",
    dependencies: ["platform.persistence"],
  },
  {
    capabilityId: "platform.authorization",
    name: "Platform Authorization",
    owner: "@apzhub/platform-authorization",
    version: "0.1.0",
    maturityLevel: "operational",
    dependencies: ["platform.identity"],
  },
  {
    capabilityId: "platform.personalisation",
    name: "Platform Personalisation",
    owner: "@apzhub/platform-personalisation",
    version: "0.1.0",
    maturityLevel: "operational",
    dependencies: ["platform.persistence"],
  },
  {
    capabilityId: "platform.governance",
    name: "Platform Governance",
    owner: "@apzhub/platform-governance",
    version: "0.1.0",
    maturityLevel: "operational",
    dependencies: ["platform.persistence"],
  },
  {
    capabilityId: "platform.provisioning",
    name: "Platform Provisioning",
    owner: "@apzhub/platform-identity",
    version: "0.1.0",
    maturityLevel: "foundation",
    dependencies: ["platform.identity"],
  },
  {
    capabilityId: "platform.security",
    name: "Platform Security",
    owner: "@apzhub/platform-security",
    version: "0.1.0",
    maturityLevel: "production",
    dependencies: ["platform.configuration"],
  },
  {
    capabilityId: "platform.configuration",
    name: "Platform Configuration",
    owner: "@apzhub/config",
    version: "0.1.0",
    maturityLevel: "production",
    dependencies: [],
  },
  {
    capabilityId: "platform.traffic-governance",
    name: "Traffic Governance",
    owner: "@apzhub/platform-security",
    version: "0.1.0",
    maturityLevel: "production",
    dependencies: ["platform.security"],
  },
  {
    capabilityId: "platform.session-security",
    name: "Session Security",
    owner: "@apzhub/auth",
    version: "0.1.0",
    maturityLevel: "production",
    dependencies: ["platform.identity", "platform.security"],
  },
  {
    capabilityId: "platform.tenant-isolation",
    name: "Tenant Isolation",
    owner: "@apzhub/platform-identity",
    version: "0.1.0",
    maturityLevel: "production",
    dependencies: ["platform.identity", "platform.persistence"],
  },
  {
    capabilityId: "platform.persistence",
    name: "Platform Persistence",
    owner: "@apzhub/config",
    version: "0.1.0",
    maturityLevel: "operational",
    dependencies: [],
  },
  {
    capabilityId: "product.law-platform",
    name: "Law Platform",
    owner: "apps/law-platform",
    version: "1.0.0",
    maturityLevel: "operational",
    dependencies: ["platform.persistence", "platform.tenant-isolation"],
  },
  {
    capabilityId: "product.trust-accounting",
    name: "Trust Accounting",
    owner: "apps/law-platform/lib/trust",
    version: "0.1.0",
    maturityLevel: "operational",
    dependencies: ["product.law-platform", "platform.persistence"],
  },
  {
    capabilityId: "platform.workbench",
    name: "Workbench Framework",
    owner: "@apzhub/workbench-framework",
    version: "0.1.0",
    maturityLevel: "operational",
    dependencies: ["platform.runtime"],
  },
  {
    capabilityId: "platform.api-framework",
    name: "API Framework",
    owner: "apps/web/lib/api",
    version: "0.1.0",
    maturityLevel: "operational",
    dependencies: ["platform.security", "platform.authorization"],
  },
  {
    capabilityId: "platform.operations",
    name: "Operations Control Plane",
    owner: "@apzhub/platform-operations",
    version: "0.1.0",
    maturityLevel: "production",
    dependencies: ["platform.bootstrap", "platform.security"],
  },
];
