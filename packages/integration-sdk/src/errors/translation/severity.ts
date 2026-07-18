import type { IntegrationErrorCategory } from "../types";
import type { IntegrationErrorSeverity } from "./types";

const CATEGORY_SEVERITY: Readonly<
  Record<IntegrationErrorCategory, IntegrationErrorSeverity>
> = {
  authentication: "error",
  authorization: "error",
  validation: "warning",
  not_found: "warning",
  conflict: "warning",
  rate_limited: "error",
  vendor_unavailable: "error",
  timeout: "error",
  mapping: "error",
  provisioning: "error",
  version_incompatible: "error",
  not_implemented: "warning",
  internal: "critical",
};

export function resolveErrorSeverity(
  category: IntegrationErrorCategory,
): IntegrationErrorSeverity {
  return CATEGORY_SEVERITY[category];
}

export function shouldTripCircuitBreaker(category: IntegrationErrorCategory): boolean {
  return (
    category === "vendor_unavailable" ||
    category === "timeout" ||
    category === "authentication"
  );
}
