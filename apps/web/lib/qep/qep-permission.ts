/**
 * Client-side QEP permission matching. Server enforcement remains authoritative.
 */

export function hasQepPermission(
  granted: readonly string[] | undefined,
  required: string,
): boolean {
  const list = granted ?? [];
  if (list.includes("*")) return true;
  if (list.includes(required)) return true;
  const segments = required.split(".");
  for (let i = segments.length - 1; i >= 1; i -= 1) {
    if (list.includes(`${segments.slice(0, i).join(".")}.*`)) return true;
  }
  return false;
}

/**
 * Nav visibility for an entitled QEP session.
 * Home-context may truncate the permission list (~80); entitled users still see
 * reader destinations. Source is never implied.
 */
export function canShowQepNavItem(input: {
  readonly entitled: boolean;
  readonly permissions?: readonly string[];
  readonly required: string;
}): boolean {
  if (!input.entitled) return false;
  if (hasQepPermission(input.permissions, input.required)) return true;
  const granted = input.permissions ?? [];
  if (granted.length === 0 || granted.length >= 80) {
    return READER_NAV_KEYS.has(input.required);
  }
  return false;
}

const READER_NAV_KEYS = new Set([
  "qep.home.read",
  "qep.portfolio.read",
  "qep.requirements.view",
  "qep.specification.read",
  "qep.suites.read",
  "qep.plan.read",
  "qep.execution.read",
  "qep.execution_workspace.read",
  "qep.automation.read",
  "qep.exploratory.read",
  "qep.experience.read",
  "qep.defects.read",
  "qep.evidence.read",
  "qep.traceability.trace_links.view",
  "qep.enterprise_requirements.read",
  "qep.risk.read",
  "qep.gate.read",
  "qep.scm.read",
  "qep.release_readiness.read",
  "qep.certification.read",
  "qep.qi.read",
  "qep.ai_workspace.read",
  "qep.enterprise_reporting.read",
  "qep.reporting.read",
  "qep.administration.read",
  "qep.integrations.read",
  "qep.audit.read",
]);
