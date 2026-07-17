/**
 * Observability Platform Services enablement (APZOBSERVE-002).
 */

export function isObserveServiceEnabled(
  env: Readonly<Record<string, string | undefined>> = process.env,
): boolean {
  const value = env.APZHUB_OBSERVE_ENABLED?.trim().toLowerCase();
  if (value === "0" || value === "false" || value === "off") return false;
  return value === "1" || value === "true" || value === "on";
}
