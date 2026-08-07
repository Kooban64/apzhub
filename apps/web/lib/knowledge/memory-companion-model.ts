/**
 * Memory Companion — experience model (N-03).
 * Shows how organisational memory appears where work is performed.
 * Actual consumer wiring remains future integration work.
 */

export type MemoryCompanionConsumer = {
  readonly productId: string;
  readonly productName: string;
  readonly experienceIntent: string;
  readonly exampleSignal: string;
  readonly ownershipNote: string;
};

export const MEMORY_COMPANION_JOURNEY =
  "Work → Relevant Organisational Memory → Confident Action" as const;

/**
 * Experience model only — no runtime wiring to consumer products in N-03.
 */
export const MEMORY_COMPANION_CONSUMERS: readonly MemoryCompanionConsumer[] = [
  {
    productId: "projects",
    productName: "APZ Projects",
    experienceIntent:
      "Surface lessons, delivery playbooks, and standards beside project work.",
    exampleSignal: "What should we remember before closing this project?",
    ownershipNote:
      "Projects remain SoR for work; Knowledge remembers lessons by reference.",
  },
  {
    productId: "support",
    productName: "APZ Support",
    experienceIntent: "Surface runbooks and solved-before memory beside incidents.",
    exampleSignal: "Have we resolved this class of incident before?",
    ownershipNote: "Support remains SoR for tickets; Knowledge curates guidance.",
  },
  {
    productId: "time",
    productName: "APZ Time",
    experienceIntent:
      "Surface guidance on how effort is understood when recording time.",
    exampleSignal: "How should this effort be classified?",
    ownershipNote: "Time remains SoR for effort; Knowledge explains practice.",
  },
  {
    productId: "documents",
    productName: "APZ Documents",
    experienceIntent: "Explain and contextualise files — never own the file lifecycle.",
    exampleSignal: "What does this document mean for how we work?",
    ownershipNote: "Documents remain SoR for files; Knowledge provides understanding.",
  },
  {
    productId: "workflow",
    productName: "APZ Workflow",
    experienceIntent:
      "Explain why processes exist and which procedures apply on a journey.",
    exampleSignal: "What should I know at this stage of the process?",
    ownershipNote: "Workflow owns business intent; Knowledge remembers how to act.",
  },
  {
    productId: "analytics",
    productName: "APZ Analytics",
    experienceIntent: "Remember decision rationale that supports better decisions.",
    exampleSignal: "Why did we decide this last time?",
    ownershipNote: "Analytics owns insight; Knowledge remembers rationale.",
  },
  {
    productId: "law",
    productName: "APZ Law",
    experienceIntent: "Explain governance in practice without absorbing policy SoR.",
    exampleSignal: "How do we apply this obligation day to day?",
    ownershipNote: "Law owns governance artefacts; Knowledge contextualises practice.",
  },
  {
    productId: "apzqep",
    productName: "APZQEP",
    experienceIntent: "Remember standards and approved practices for quality work.",
    exampleSignal: "Which approved practices apply to this change?",
    ownershipNote: "APZQEP owns quality evidence; Knowledge remembers practice.",
  },
] as const;

export const MEMORY_HOME_PROMPTS = [
  {
    id: "know-today",
    question: "What should I know today?",
    hint: "Start from organisational memory that applies to current work.",
  },
  {
    id: "guidance-applies",
    question: "What guidance applies to my work?",
    hint: "Procedures and operational guidance for the task at hand.",
  },
  {
    id: "learned",
    question: "What has the organisation learned about this?",
    hint: "Lessons derived from completed Projects and Support.",
  },
  {
    id: "practices",
    question: "Which approved practices should I follow?",
    hint: "Standards and best practices from trusted experience.",
  },
] as const;
