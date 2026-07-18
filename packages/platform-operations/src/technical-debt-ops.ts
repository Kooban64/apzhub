import type { TechnicalDebtOpsItem } from "./types";

/** Curated open technical debt snapshot for operations visibility (PRH-008). */
export const OPEN_TECHNICAL_DEBT_OPS_ITEMS: readonly TechnicalDebtOpsItem[] = [
  {
    id: "TD-P18",
    priority: "high",
    summary: "Outbox workers not implemented",
    milestone: "Post-M8 workers",
  },
  {
    id: "TD-P19",
    priority: "high",
    summary: "Event replay not implemented",
    milestone: "Post-M8 workers",
  },
  {
    id: "TD-T06",
    priority: "high",
    summary: "No bank feeds / three-way reconciliation",
    milestone: "Trust Phase 2",
  },
  {
    id: "TD-M16-M02",
    priority: "medium",
    summary: "No GitHub Actions CI workflow",
    milestone: "M17",
  },
  {
    id: "TD-T04",
    priority: "medium",
    summary: "Playwright E2E not green in CI",
    milestone: "M17 CI",
  },
  {
    id: "TD-P04",
    priority: "medium",
    summary: "runSync() sync bridge over async postgres",
    milestone: "Async executor",
  },
  {
    id: "TD-T01",
    priority: "medium",
    summary: "Workbench vs API separate in-memory trust bundles",
    milestone: "LAW-015-15",
  },
  {
    id: "TD-P02",
    priority: "high",
    summary: "RBAC partially resolved — admin UI remains",
    milestone: "M8-02",
  },
];

export const TECHNICAL_DEBT_REGISTER_REFERENCE =
  "docs/architecture/APZHUB-Platform-Technical-Debt-Register.md";
