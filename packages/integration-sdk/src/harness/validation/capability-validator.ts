import type { HarnessCheckResult } from "../types";
import {
  INTEGRATION_CAPABILITIES,
  isIntegrationCapabilityId,
} from "../../adapter/capability-types";

export interface CapabilityValidationInput {
  readonly declared: readonly string[];
  readonly required?: readonly string[];
  readonly knownCapabilityIds?: readonly string[];
}

export function validateAdapterCapabilities(
  input: CapabilityValidationInput,
): readonly HarnessCheckResult[] {
  const checks: HarnessCheckResult[] = [];
  const required = input.required ?? ["authentication", "health", "diagnostics"];
  const known = new Set(
    (input.knownCapabilityIds ?? [...INTEGRATION_CAPABILITIES]).map(String),
  );

  checks.push({
    id: "caps.count",
    name: "At least one capability declared",
    outcome: input.declared.length > 0 ? "pass" : "fail",
    message:
      input.declared.length > 0
        ? `${input.declared.length} capabilities declared`
        : "No capabilities declared",
  });

  for (const cap of required) {
    checks.push({
      id: `caps.required.${cap}`,
      name: `Required capability ${cap}`,
      outcome: input.declared.includes(cap) ? "pass" : "fail",
      message: input.declared.includes(cap) ? "Present" : "Missing",
    });
  }

  for (const cap of input.declared) {
    const knownId =
      known.has(cap) || (typeof cap === "string" && isIntegrationCapabilityId(cap));
    checks.push({
      id: `caps.known.${cap}`,
      name: `Known capability id ${cap}`,
      outcome: knownId ? "pass" : "warn",
      message: knownId
        ? "Recognised capability id"
        : "Unknown / vendor-extended capability id (warn only)",
    });
  }

  return checks;
}
