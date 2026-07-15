import type {
  AdapterPackageStructure,
  HarnessCheckOutcome,
  HarnessCheckResult,
} from "../types";

export interface AdapterComplianceInput {
  readonly structure: AdapterPackageStructure;
  readonly requiredInterfaces?: readonly string[];
  readonly requiredCapabilities?: readonly string[];
  readonly requiredDocs?: readonly string[];
  readonly forbiddenDependencies?: readonly string[];
}

export interface AdapterComplianceResult {
  readonly vendorId: string;
  readonly overall: HarnessCheckOutcome;
  readonly checks: readonly HarnessCheckResult[];
  readonly summary: string;
}
