/**
 * Illustrative organisational memory catalogue (N-03 experience).
 * Objects are derived references — not a document library.
 * Persistence / curation workflows expand under future Owner Auth.
 */

import type { MemoryTypeKey } from "./memory-types";

export type MemoryObject = {
  readonly id: string;
  readonly type: MemoryTypeKey;
  readonly title: string;
  readonly summary: string;
  readonly appliesWhen: string;
  readonly derivedFrom: string;
  readonly status: "published" | "review";
};

export const MEMORY_CATALOGUE: readonly MemoryObject[] = [
  {
    id: "lesson-handover-checklist",
    type: "lessons",
    title: "Handover gaps cause rework after project close",
    summary:
      "When delivery closes without a structured handover, the next team rediscovers constraints already known.",
    appliesWhen: "Closing a project or transferring ownership",
    derivedFrom: "APZ Projects — completed delivery retrospectives",
    status: "published",
  },
  {
    id: "lesson-repeat-incident",
    type: "lessons",
    title: "Recurring incidents share missing operational guidance",
    summary:
      "Tickets that reopen often lacked a published runbook at first resolution.",
    appliesWhen: "Resolving or reviewing Support incidents",
    derivedFrom: "APZ Support — closed incident themes",
    status: "published",
  },
  {
    id: "standard-change-evidence",
    type: "standards",
    title: "Quality evidence before release",
    summary: "Product changes require an approved Decision Package before release.",
    appliesWhen: "Preparing a product or platform change",
    derivedFrom: "APZQEP — quality lifecycle",
    status: "published",
  },
  {
    id: "procedure-incident-escalation",
    type: "procedures",
    title: "Escalate service impact within agreed windows",
    summary:
      "When impact thresholds are met, escalate using the approved service procedure — do not invent a parallel path.",
    appliesWhen: "Handling high-impact Support cases",
    derivedFrom: "APZ Support · APZ Workflow practice",
    status: "published",
  },
  {
    id: "guidance-time-charging",
    type: "guidance",
    title: "How effort is understood for client work",
    summary:
      "Guidance on classifying effort so time records stay consistent with organisational practice.",
    appliesWhen: "Recording time against projects or clients",
    derivedFrom: "APZ Time · operational practice",
    status: "published",
  },
  {
    id: "rationale-memory-not-search",
    type: "rationale",
    title: "Why Knowledge is organisational memory, not search",
    summary:
      "Search retrieves; memory curates understanding so people act correctly in context.",
    appliesWhen: "Explaining APZ Knowledge product identity",
    derivedFrom: "Product Board — Knowledge Mission",
    status: "published",
  },
  {
    id: "practice-governance-first",
    type: "practices",
    title: "Ask governance questions before convenient shortcuts",
    summary:
      "When governance and convenience conflict, follow the approved governance path.",
    appliesWhen: "Acting under policy or compliance constraints",
    derivedFrom: "APZ Law · Product Board principles",
    status: "published",
  },
  {
    id: "reference-sor-boundaries",
    type: "reference",
    title: "Systems of Record stay with their products",
    summary:
      "Knowledge explains and references; it never becomes the SoR for files, tickets, policies, or work.",
    appliesWhen: "Curating or consuming organisational memory",
    derivedFrom: "APZHUB portfolio architecture",
    status: "published",
  },
] as const;

export function listMemoryByType(type: MemoryTypeKey): readonly MemoryObject[] {
  return MEMORY_CATALOGUE.filter((item) => item.type === type);
}

export function getMemoryObject(id: string): MemoryObject | undefined {
  return MEMORY_CATALOGUE.find((item) => item.id === id);
}

export function listPublishedMemory(): readonly MemoryObject[] {
  return MEMORY_CATALOGUE.filter((item) => item.status === "published");
}
