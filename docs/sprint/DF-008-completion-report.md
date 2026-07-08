# DF-008 — Completion Report

> **Story:** DF-008 — Workbench navigation knowledge source  
> **Sprint:** SPR-005 — Knowledge & Discovery Framework  
> **Date:** 2026-06-28  
> **Status:** Complete — **await review before DF-009**

---

## Objective

Implement the Workbench Navigation Knowledge Provider — project `WorkbenchRegistryDto` navigation contributions as `KnowledgeDocument` objects with navigation references only. Support keyword and fuzzy matching through the existing orchestrator. No navigation execution, no Workbench Framework changes, no `apps/web` wiring.

---

## Acceptance criteria

| Criterion                                                                     | Status                                                    |
| ----------------------------------------------------------------------------- | --------------------------------------------------------- |
| `WorkbenchNavigationKnowledgeProvider` implemented                            | ✅                                                        |
| Maps nav items and views to `KnowledgeDocument`                               | ✅                                                        |
| Includes workspace, activity bar, sidebar, parent/child, route, icon metadata | ✅                                                        |
| Keyword + fuzzy via orchestrator                                              | ✅                                                        |
| Navigation references only (`navigation`, no `actionRef`)                     | ✅                                                        |
| Provider diagnostics                                                          | ✅ `buildWorkbenchNavigationKnowledgeProviderDiagnostics` |
| Permission-filtered DTO input                                                 | ✅                                                        |
| Deterministic ordering + parent/child preservation                            | ✅                                                        |
| No navigation execution                                                       | ✅                                                        |
| No Workbench Framework changes                                                | ✅                                                        |
| Quality gates pass                                                            | ✅                                                        |
| Owner review before DF-009                                                    | ⏳ Pending                                                |

---

## Implementation summary

### Provider module (`src/provider/workbench-navigation/`)

| Export                                                 | Role                                        |
| ------------------------------------------------------ | ------------------------------------------- |
| `WorkbenchNavigationKnowledgeProvider`                 | Projects `WorkbenchRegistryDto` → documents |
| `createWorkbenchNavigationKnowledgeProvider`           | Factory                                     |
| `registerWorkbenchNavigationKnowledgeProvider`         | Register on `platform.navigation`           |
| `mapNavItemToKnowledgeDocument`                        | Single nav item mapping                     |
| `mapViewToKnowledgeDocument`                           | View descriptor mapping                     |
| `mapWorkbenchRegistryDtoToKnowledgeDocuments`          | Batch mapping with hierarchy sort           |
| `buildWorkbenchNavigationKnowledgeProviderDiagnostics` | Provider observability                      |
| `WORKBENCH_REGISTRY_DTO_FIXTURE`                       | Test fixtures                               |

### Document mapping

| Workbench field         | KnowledgeDocument field                                                           |
| ----------------------- | --------------------------------------------------------------------------------- |
| `id`                    | `documentId`, `metadata.navItemId`, `keywords`                                    |
| `label`                 | `title`                                                                           |
| `workspace`             | `category`, `navigation.workspaceId`, `keywords`                                  |
| `level`                 | `kind` (`workspace` for activity-bar/workspace; `navigation` for sidebar/context) |
| `route`                 | `navigation.target`, `metadata.route`                                             |
| `parent`                | `metadata.parent` (hierarchy preserved in sort order)                             |
| `icon`                  | `icon`                                                                            |
| `permission`            | `permission`                                                                      |
| `viewId`, `title`, etc. | View documents with `metadata.viewId`                                             |

Hidden nav items (`hidden: true`) are excluded from projection.

### Status constant

| Constant                               | Previous            | Current                 |
| -------------------------------------- | ------------------- | ----------------------- |
| `KNOWLEDGE_DISCOVERY_FRAMEWORK_STATUS` | `"action-provider"` | `"navigation-provider"` |

---

## Test results

| Suite                                             | Tests         |
| ------------------------------------------------- | ------------- |
| `map-navigation-to-knowledge-document.test.ts`    | 4             |
| `workbench-navigation-knowledge-provider.test.ts` | 9             |
| **Total monorepo**                                | **787** (+13) |

### Scenarios covered

| Scenario                                    | Covered |
| ------------------------------------------- | ------- |
| Navigation document mapping                 | ✅      |
| Workspace hierarchy / parent-child ordering | ✅      |
| Keyword query via orchestrator              | ✅      |
| Fuzzy query via orchestrator                | ✅      |
| Empty navigation DTO                        | ✅      |
| Permission-filtered `WorkbenchRegistryDto`  | ✅      |
| Provider diagnostics                        | ✅      |
| Deterministic ordering                      | ✅      |
| Knowledge DTO boundary                      | ✅      |

### Coverage

| Scope     | Coverage         |
| --------- | ---------------- |
| All files | **91.37%** lines |

---

## Architecture compliance

| Rule                                                        | Result |
| ----------------------------------------------------------- | ------ |
| Returns `navigation` references only — no routing execution | ✅     |
| Consumes Workbench DTO — no duplication                     | ✅     |
| No Workbench Framework changes                              | ✅     |
| Orchestrator handles keyword/fuzzy ranking                  | ✅     |
| No new execution path                                       | ✅     |
| No persistence / semantic / AI                              | ✅     |
| No `apps/web` wiring                                        | ✅     |

---

## Technical debt

| ID         | Description                                                            | Severity | Target     |
| ---------- | ---------------------------------------------------------------------- | -------- | ---------- |
| TD-DF08-01 | Provider not auto-registered during bootstrap                          | Medium   | DF-015     |
| TD-DF08-02 | Hidden nav items excluded — no diagnostics on client                   | Low      | DF-010     |
| TD-DF08-03 | View and nav item documents may share routes (deduped by orchestrator) | Low      | Acceptable |
| TD-DF07-01 | Action provider not auto-registered during bootstrap                   | Medium   | DF-015     |
| TD-DF06-04 | Server hydration pipeline not wired                                    | Medium   | DF-015     |

---

## Recommendations for DF-009

1. **Implement `KnowledgeRankingContext`** — recency and frequency hooks applied as orchestrator merge boost.

2. **Do not change providers** — ranking scaffold layers on orchestrator after provider documents are merged.

3. **Add `recordKnowledgeSelection(documentId)`** — client session scope only; no PostgreSQL.

4. **Extend query diagnostics** — optional ranking boost counts.

5. **Keep Action and Navigation providers unchanged** — DF-009 is orchestrator ranking only.

---

## Quality gates

| Gate                 | Result           |
| -------------------- | ---------------- |
| `pnpm lint`          | ✅ Pass          |
| `pnpm typecheck`     | ✅ Pass          |
| `pnpm build`         | ✅ Pass          |
| `pnpm test`          | ✅ Pass (787)    |
| `pnpm test:coverage` | ✅ Pass (91.37%) |
| `pnpm test:e2e`      | ✅ Pass (19/19)  |

---

## Stop condition

DF-008 complete. **Do not begin DF-009** until this report is reviewed and approved.

Next story upon approval: **DF-009 — Ranking scaffold (recency + frequency)**.

---

_DF-008 Completion Report — Sprint 005 Knowledge & Discovery Framework._
