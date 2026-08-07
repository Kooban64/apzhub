/**
 * Organisational memory object types — business concepts (N-03).
 * Not articles, documents, or wiki pages.
 */

export const MEMORY_TYPE_KEYS = [
  "lessons",
  "standards",
  "procedures",
  "guidance",
  "rationale",
  "practices",
  "reference",
] as const;

export type MemoryTypeKey = (typeof MEMORY_TYPE_KEYS)[number];

export type MemoryTypeDefinition = {
  readonly key: MemoryTypeKey;
  readonly label: string;
  readonly pluralLabel: string;
  readonly question: string;
  readonly description: string;
  readonly derivesFrom: string;
};

export const MEMORY_TYPES: readonly MemoryTypeDefinition[] = [
  {
    key: "lessons",
    label: "Lesson learned",
    pluralLabel: "Lessons learned",
    question: "What has the organisation learned about this?",
    description: "Captured understanding from completed work and incidents.",
    derivesFrom: "APZ Projects · APZ Support",
  },
  {
    key: "standards",
    label: "Standard",
    pluralLabel: "Standards",
    question: "Which approved standards apply?",
    description: "Engineering and operational standards the organisation trusts.",
    derivesFrom: "APZQEP · approved practice",
  },
  {
    key: "procedures",
    label: "Procedure",
    pluralLabel: "Procedures",
    question: "Which approved procedures should I follow?",
    description: "How-to organisational memory for repeatable work.",
    derivesFrom: "Workflow · operational practice",
  },
  {
    key: "guidance",
    label: "Operational guidance",
    pluralLabel: "Operational guidance",
    question: "What guidance applies to my work?",
    description: "Playbooks and runbooks that support correct action.",
    derivesFrom: "Support · Workflow · Projects",
  },
  {
    key: "rationale",
    label: "Decision rationale",
    pluralLabel: "Decision rationale",
    question: "Why did we decide this?",
    description: "Remembered reasons behind important decisions.",
    derivesFrom: "Product Board · Analytics context",
  },
  {
    key: "practices",
    label: "Best practice",
    pluralLabel: "Best practices",
    question: "What is the approved way to do this well?",
    description: "Curated practices that improve consistency.",
    derivesFrom: "APZQEP · organisational experience",
  },
  {
    key: "reference",
    label: "Reference knowledge",
    pluralLabel: "Reference knowledge",
    question: "What background understanding do I need?",
    description: "Explanatory memory that contextualises SoR artefacts.",
    derivesFrom: "Documents · Law · Board records (by reference)",
  },
] as const;

export function isMemoryTypeKey(value: string): value is MemoryTypeKey {
  return (MEMORY_TYPE_KEYS as readonly string[]).includes(value);
}

export function getMemoryType(key: MemoryTypeKey): MemoryTypeDefinition | undefined {
  return MEMORY_TYPES.find((type) => type.key === key);
}
