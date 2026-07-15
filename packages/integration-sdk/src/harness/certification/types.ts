import type {
  HarnessCategoryResult,
  HarnessCheckOutcome,
  HarnessCheckResult,
} from "../types";

export type CertificationCategory =
  | "Architecture"
  | "Dependencies"
  | "Capabilities"
  | "Compatibility"
  | "Diagnostics"
  | "Health"
  | "Performance"
  | "Coverage"
  | "Documentation"
  | "QualityGates";

export const CERTIFICATION_CATEGORIES: readonly CertificationCategory[] = [
  "Architecture",
  "Dependencies",
  "Capabilities",
  "Compatibility",
  "Diagnostics",
  "Health",
  "Performance",
  "Coverage",
  "Documentation",
  "QualityGates",
] as const;

export interface CertificationCategoryInput {
  readonly category: CertificationCategory;
  readonly checks?: readonly HarnessCheckResult[];
  /** When true, category is treated as skip if no checks supplied. */
  readonly optional?: boolean;
}

export interface AdapterCertificationSubject {
  readonly vendorId: string;
  readonly adapterVersion: string;
  readonly packageName: string;
  readonly declaredCapabilities?: readonly string[];
  readonly extendsAdapterBase?: boolean;
  readonly importsPlatformServices?: boolean;
  readonly importsEntityMappingStore?: boolean;
  readonly hasHealth?: boolean;
  readonly hasDiagnostics?: boolean;
  readonly hasCompatibilityMatrix?: boolean;
  readonly hasCapabilityCertification?: boolean;
  readonly documentationComplete?: boolean;
  readonly coverageLinesPct?: number;
  readonly qualityGatesPassing?: boolean;
  readonly performanceBaselineRecorded?: boolean;
  readonly dependencyAuditPassing?: boolean;
  readonly categories?: readonly CertificationCategoryInput[];
  readonly knownLimitations?: readonly string[];
}

export interface AdapterCertificationReport {
  readonly vendorId: string;
  readonly adapterVersion: string;
  readonly packageName: string;
  readonly overall: HarnessCheckOutcome;
  readonly categories: readonly HarnessCategoryResult[];
  readonly certifiedAt: string;
  readonly knownLimitations: readonly string[];
  readonly summary: string;
}
