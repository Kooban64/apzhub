import type { PlatformProductKey } from "@apzhub/testing-contracts";

export interface DefaultGovernedProductSpec {
  readonly key: PlatformProductKey;
  readonly displayName: string;
  readonly owner: string;
  readonly version: string;
}

/** Canonical eight APZHUB products for the Platform Product Registry. */
export const DEFAULT_PRODUCTS: readonly DefaultGovernedProductSpec[] = [
  {
    key: "projects",
    displayName: "Projects",
    owner: "Projects Product Owner",
    version: "1.0.0",
  },
  {
    key: "support",
    displayName: "Support",
    owner: "Support Product Owner",
    version: "1.0.0",
  },
  {
    key: "testing",
    displayName: "Testing",
    owner: "Testing Product Owner",
    version: "1.0.0",
  },
  {
    key: "identity",
    displayName: "Identity",
    owner: "Identity Product Owner",
    version: "1.0.0",
  },
  {
    key: "documents",
    displayName: "Documents",
    owner: "Documents Product Owner",
    version: "1.0.0",
  },
  {
    key: "analytics",
    displayName: "Analytics",
    owner: "Analytics Product Owner",
    version: "1.0.0",
  },
  {
    key: "workflow",
    displayName: "Workflow",
    owner: "Workflow Product Owner",
    version: "1.0.0",
  },
  {
    key: "administration",
    displayName: "Administration",
    owner: "Administration Product Owner",
    version: "1.0.0",
  },
] as const;
