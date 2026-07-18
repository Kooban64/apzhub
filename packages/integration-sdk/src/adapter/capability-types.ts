/** Platform capability identifiers adapters may declare — extensible without adapter changes. */
export const INTEGRATION_CAPABILITIES = [
  "authentication",
  "health",
  "diagnostics",
  "projects",
  "tickets",
  "documents",
  "analytics",
  "time_tracking",
  "workflow",
  "notifications",
  "search",
  "webhooks",
  "polling",
] as const;

export type IntegrationCapabilityId = (typeof INTEGRATION_CAPABILITIES)[number];

const CAPABILITY_SET = new Set<string>(INTEGRATION_CAPABILITIES);

export function isIntegrationCapabilityId(
  value: string,
): value is IntegrationCapabilityId {
  return CAPABILITY_SET.has(value);
}

export function parseIntegrationCapabilities(
  values: readonly string[],
): readonly IntegrationCapabilityId[] {
  return values.filter(isIntegrationCapabilityId);
}
