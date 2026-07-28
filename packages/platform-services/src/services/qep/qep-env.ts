/**
 * QEP Platform Services enablement (APZQEP-ENG-020B).
 * Enabled by default unless APZHUB_QEP_ENABLED is explicitly false.
 */

export function isQepServiceEnabled(
  env: Readonly<Record<string, string | undefined>> = process.env,
): boolean {
  const value = env.APZHUB_QEP_ENABLED?.trim().toLowerCase();
  if (value === "0" || value === "false" || value === "off") {
    return false;
  }
  return true;
}
