/**
 * Search integration compatibility report — declarative only, no engine probes.
 */

import type { SearchCapabilities, SearchProviderKind } from "@apzhub/search-contracts";
import type { SearchIntegrationCapabilityId } from "../capabilities/constants";
import { toSearchCapabilities } from "../capabilities/constants";
import { SEARCH_INTEGRATION_SDK_VERSION } from "../version";

export type SearchCompatibilityClassification =
  | "supported"
  | "degraded"
  | "unsupported"
  | "unknown";

export type SearchCompatibilityReport = {
  readonly sdkVersion: typeof SEARCH_INTEGRATION_SDK_VERSION;
  readonly providerKind?: SearchProviderKind;
  readonly classification: SearchCompatibilityClassification;
  readonly declaredCapabilities: readonly SearchIntegrationCapabilityId[];
  readonly contractCapabilities: SearchCapabilities;
  readonly requiredCapabilities: readonly SearchIntegrationCapabilityId[];
  readonly missingCapabilities: readonly SearchIntegrationCapabilityId[];
  readonly forbiddenFlags: readonly string[];
  readonly engineBound: false;
  readonly executionEnabled: false;
  readonly message: string;
  readonly checkedAt: string;
};

export type EvaluateSearchCompatibilityInput = {
  readonly declaredCapabilities: readonly SearchIntegrationCapabilityId[];
  readonly requiredCapabilities?: readonly SearchIntegrationCapabilityId[];
  readonly providerKind?: SearchProviderKind;
  readonly contractCapabilities?: SearchCapabilities;
  readonly now?: () => string;
};

export function evaluateSearchCompatibility(
  input: EvaluateSearchCompatibilityInput,
): SearchCompatibilityReport {
  const required =
    input.requiredCapabilities ??
    (["keyword_search", "health", "diagnostics"] as const);
  const missing = required.filter((c) => !input.declaredCapabilities.includes(c));
  const contract =
    input.contractCapabilities ?? toSearchCapabilities(input.declaredCapabilities);

  const forbiddenFlags: string[] = [];
  if (contract.semantic) forbiddenFlags.push("semantic");
  if (contract.vector) forbiddenFlags.push("vector");
  if (contract.fuzzy) forbiddenFlags.push("fuzzy");

  let classification: SearchCompatibilityClassification = "supported";
  if (forbiddenFlags.length > 0) {
    classification = "unsupported";
  } else if (missing.length > 0) {
    classification = missing.includes("keyword_search") ? "unsupported" : "degraded";
  } else if (!input.providerKind) {
    classification = "unknown";
  }

  return {
    sdkVersion: SEARCH_INTEGRATION_SDK_VERSION,
    providerKind: input.providerKind,
    classification,
    declaredCapabilities: input.declaredCapabilities,
    contractCapabilities: {
      ...contract,
      semantic: false,
      vector: false,
      fuzzy: false,
    },
    requiredCapabilities: required,
    missingCapabilities: missing,
    forbiddenFlags,
    engineBound: false,
    executionEnabled: false,
    message: `Search integration compatibility: ${classification} (APZSEARCH-004 SDK — no engine)`,
    checkedAt: (input.now ?? (() => new Date().toISOString()))(),
  };
}

/** Class alias matching milestone vocabulary. */
export class SearchCompatibilityReportBuilder {
  evaluate(input: EvaluateSearchCompatibilityInput): SearchCompatibilityReport {
    return evaluateSearchCompatibility(input);
  }
}

export function createSearchCompatibilityReportBuilder(): SearchCompatibilityReportBuilder {
  return new SearchCompatibilityReportBuilder();
}
