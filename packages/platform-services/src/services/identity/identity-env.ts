/**
 * Identity Administration Platform Services enablement (APZIDENTITY-002).
 */

export function isIdentityServiceEnabled(
  env: Readonly<Record<string, string | undefined>> = process.env,
): boolean {
  const value = env.APZHUB_IDENTITY_ENABLED?.trim().toLowerCase();
  if (value === "0" || value === "false" || value === "off") return false;
  return value === "1" || value === "true" || value === "on";
}
