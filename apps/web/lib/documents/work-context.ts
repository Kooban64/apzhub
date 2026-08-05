/**
 * Presentation helpers for document work context (N-03).
 * References only — no SoR duplication.
 */

export type WorkReferenceKind =
  "project" | "support" | "evidence" | "matter" | "workflow" | "time" | "other";

export type DocumentWorkReference = {
  readonly kind: WorkReferenceKind;
  readonly product: string;
  readonly externalId: string;
  readonly label?: string;
};

export const WORK_CONTEXT_SLOTS: readonly {
  readonly kind: WorkReferenceKind;
  readonly label: string;
  readonly startPath: string;
  readonly startLabel: string;
}[] = [
  {
    kind: "project",
    label: "Related project",
    startPath: "/workspace/projects",
    startLabel: "Open Projects",
  },
  {
    kind: "support",
    label: "Related support request",
    startPath: "/workspace/support",
    startLabel: "Open Support",
  },
  {
    kind: "evidence",
    label: "Related quality evidence",
    startPath: "/workspace/qep",
    startLabel: "Open Quality",
  },
  {
    kind: "matter",
    label: "Related matter",
    startPath: "/workspace/law",
    startLabel: "Open Law",
  },
  {
    kind: "workflow",
    label: "Related workflow",
    startPath: "/workspace/home",
    startLabel: "My Work",
  },
] as const;

export function formatWorkReferenceKind(kind: string): string {
  switch (kind) {
    case "belongs_to_project":
    case "project":
      return "Project";
    case "belongs_to_support":
    case "support":
      return "Support request";
    case "evidence_for":
    case "evidence":
      return "Quality evidence";
    case "matter":
      return "Matter";
    case "workflow":
      return "Workflow";
    case "attached_to":
      return "Attached work";
    default:
      return kind.replace(/_/g, " ");
  }
}

/** Map relationship kind string → slot kind when possible. */
export function relationshipKindToSlot(kind: string): WorkReferenceKind | null {
  if (kind.includes("project")) return "project";
  if (kind.includes("support")) return "support";
  if (kind.includes("evidence") || kind.includes("testing")) return "evidence";
  if (kind.includes("law") || kind.includes("matter")) return "matter";
  if (kind.includes("workflow")) return "workflow";
  if (kind.includes("time")) return "time";
  return null;
}
