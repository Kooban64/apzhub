/**
 * Workflow Platform Services enablement (APZWORKFLOW-002).
 */

export function isWorkflowServiceEnabled(
  env: Readonly<Record<string, string | undefined>> = process.env,
): boolean {
  const value = env.APZHUB_WORKFLOW_ENABLED?.trim().toLowerCase();
  if (value === "0" || value === "false" || value === "off") return false;
  return value === "1" || value === "true" || value === "on";
}
