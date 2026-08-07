/**
 * Governance in Context — experience model (N-03).
 * Establishes how governance appears where work is performed.
 * Actual consumer wiring in Projects / Workflow / Documents / Support / APZQEP
 * remains future integration work (explicitly out of N-03 scope).
 */

export type GovernanceContextConsumer = {
  readonly productId: string;
  readonly productName: string;
  readonly experienceIntent: string;
  readonly exampleSignal: string;
  readonly ownershipNote: string;
};

/**
 * Experience model only — no runtime wiring to consumer products in N-03.
 */
export const GOVERNANCE_CONTEXT_CONSUMERS: readonly GovernanceContextConsumer[] = [
  {
    productId: "projects",
    productName: "APZ Projects",
    experienceIntent: "Show applicable policies and project obligations in context.",
    exampleSignal: "Which approvals are required for this project action?",
    ownershipNote:
      "Projects remain SoR for delivery; Law owns obligations by reference.",
  },
  {
    productId: "workflow",
    productName: "APZ Workflow",
    experienceIntent: "Surface required approvals and obligations on journeys.",
    exampleSignal: "Which obligations apply to this business process stage?",
    ownershipNote:
      "Workflow owns business intent; Law governs legal/compliance obligations.",
  },
  {
    productId: "documents",
    productName: "APZ Documents",
    experienceIntent: "Show retention requirements on documents and artefacts.",
    exampleSignal: "How long must this information be retained?",
    ownershipNote:
      "Documents own information lifecycle; Law owns retention requirements.",
  },
  {
    productId: "support",
    productName: "APZ Support",
    experienceIntent: "Highlight regulatory duties relevant to service cases.",
    exampleSignal: "Does this incident trigger a regulatory requirement?",
    ownershipNote: "Support owns tickets; Law references applicable duties.",
  },
  {
    productId: "apzqep",
    productName: "APZQEP",
    experienceIntent: "Link compliance evidence without absorbing quality SoR.",
    exampleSignal: "What governance evidence supports this release?",
    ownershipNote:
      "APZQEP owns quality/release evidence; Law owns governance evidence objects.",
  },
] as const;

export const GOVERNANCE_CONTEXT_JOURNEY =
  "Work → Governance Context → Confident Action" as const;
