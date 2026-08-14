/** APZ Knowledge steward — capture/curate memory without knowledge.admin. */

export const DEFAULT_KNOWLEDGE_STEWARD_ROLE_ID = "role-knowledge-steward";

export const KNOWLEDGE_STEWARD_PERMISSIONS = [
  "knowledge.view",
  "knowledge.manage",
] as const;

/** When true, auto-provision also assigns knowledge-steward (dev/local only). */
export function isKnowledgeStewardAutoAssignEnabled(
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  const raw = (env.APZHUB_KNOWLEDGE_STEWARD_AUTO_ASSIGN ?? "").toLowerCase();
  return raw === "true" || raw === "1" || raw === "yes";
}
