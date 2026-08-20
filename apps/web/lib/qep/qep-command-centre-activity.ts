/**
 * Presentation filter for Quality Command Centre activity.
 * Does not mutate the audit ledger. Omits infrastructure/provider noise.
 */

export function isQualityCommandCentreActivity(event: {
  readonly action: string;
  readonly detail?: string;
}): boolean {
  const action = event.action.trim().toLowerCase();
  const detail = (event.detail ?? "").trim().toLowerCase();
  const blob = `${action} ${detail}`;

  if (blob.includes("unavailable:none")) return false;
  if (action.startsWith("bridge.")) return false;
  if (blob.includes("security_assurance")) return false;
  if (blob.includes("tokenhealth") || blob.includes("token_health")) return false;

  return (
    action.startsWith("defect") ||
    action.startsWith("execution") ||
    action.startsWith("evidence") ||
    action.startsWith("requirement") ||
    action.startsWith("qep.defect") ||
    action.startsWith("qep.execution") ||
    action.startsWith("qep.evidence") ||
    action.startsWith("qep.requirement") ||
    action.startsWith("qep.plan") ||
    action.startsWith("qep.spec") ||
    action.startsWith("qep.suite") ||
    action.startsWith("qep.trace") ||
    action.startsWith("qep.cert") ||
    /\b(defect|execution|evidence|requirement|retest|test case|test plan|traceability|certification)\b/.test(
      blob,
    )
  );
}
