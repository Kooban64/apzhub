/**
 * Observability Platform Services enablement (APZOBSERVE-002 + ADR-0070).
 */

export function isObserveServiceEnabled(
  env: Readonly<Record<string, string | undefined>> = process.env,
): boolean {
  const value = env.APZHUB_OBSERVE_ENABLED?.trim().toLowerCase();
  if (value === "0" || value === "false" || value === "off") return false;
  return value === "1" || value === "true" || value === "on";
}

/**
 * Deny-by-default live alert evaluation (ADR-0070 / Platform-1.3-ENG-002).
 *
 * Default: disabled when unset / empty / invalid.
 * Allowed truthy: true | 1 | on
 * Allowed falsy: false | 0 | off | unset
 * Production recommendation: leave unset until ops rollout; then set true explicitly.
 * Failure behaviour: invalid values do not activate evaluation.
 */
export function isObserveAlertEvaluationEnabled(
  env: Readonly<Record<string, string | undefined>> = process.env,
): boolean {
  const value = env.APZHUB_OBSERVE_ALERT_EVALUATION_ENABLED?.trim().toLowerCase();
  return value === "true" || value === "1" || value === "on";
}
