# DF-007 — Completion Report

> **Story:** DF-007 — Action Registry knowledge source  
> **Sprint:** SPR-005 — Knowledge & Discovery Framework  
> **Date:** 2026-06-28  
> **Status:** Complete — **await review before DF-008**

---

## Objective

Implement the Action Registry Knowledge Provider — project `ActionRegistryDto` actions as `KnowledgeDocument` objects with action references only. Support keyword and fuzzy matching through the existing orchestrator. No action execution, no `apps/web` wiring.

---

## Acceptance criteria

| Criterion                                                                  | Status                                               |
| -------------------------------------------------------------------------- | ---------------------------------------------------- |
| `ActionRegistryKnowledgeProvider` implemented                              | ✅                                                   |
| Maps actions to `KnowledgeDocument` with `actionRef`                       | ✅                                                   |
| Includes id, label, description, group, shortcut, source, surface metadata | ✅                                                   |
| Keyword + fuzzy via orchestrator                                           | ✅                                                   |
| Provider diagnostics                                                       | ✅ `buildActionRegistryKnowledgeProviderDiagnostics` |
| Permission-filtered DTO input supported                                    | ✅                                                   |
| Deterministic ordering                                                     | ✅ `order` then `id`                                 |
| No action execution                                                        | ✅                                                   |
| No duplicate Action Registry storage                                       | ✅ Consumes DTO snapshot                             |
| No `apps/web` wiring                                                       | ✅                                                   |
| Quality gates pass                                                         | ✅                                                   |
| Owner review before DF-008                                                 | ⏳ Pending                                           |

---

## Implementation summary

### Provider module (`src/provider/action-registry/`)

| Export                                            | Role                                                 |
| ------------------------------------------------- | ---------------------------------------------------- |
| `ActionRegistryKnowledgeProvider`                 | Projects `ActionRegistryDto` → `KnowledgeDocument[]` |
| `createActionRegistryKnowledgeProvider`           | Factory                                              |
| `registerActionRegistryKnowledgeProvider`         | Register on `platform.actions`                       |
| `mapActionDescriptorToKnowledgeDocument`          | Single action mapping                                |
| `mapActionRegistryDtoToKnowledgeDocuments`        | Batch mapping with sort                              |
| `buildActionRegistryKnowledgeProviderDiagnostics` | Provider observability                               |
| `ACTION_REGISTRY_DTO_FIXTURE`                     | Test fixtures                                        |

### Document mapping

| Action field                     | KnowledgeDocument field                        |
| -------------------------------- | ---------------------------------------------- |
| `id`                             | `actionRef.actionId`, `documentId`, `keywords` |
| `label`                          | `title`, `metadata.label`                      |
| `description`                    | `description`, `keywords`                      |
| `group`                          | `category`, `metadata.group`, `keywords`       |
| `shortcut`                       | `metadata.shortcut`, `keywords`                |
| `source`                         | `metadata.source`                              |
| `contextWhen.surfaces`           | `metadata.surfaces`                            |
| `icon`, `palette`, `order`, etc. | `metadata.*`                                   |

### Dependency added

`@apzhub/command-framework` — `ActionDescriptor` + `ActionRegistryDto` / `filterActionRegistryDto`.

### Status constant

| Constant                               | Previous         | Current             |
| -------------------------------------- | ---------------- | ------------------- |
| `KNOWLEDGE_DISCOVERY_FRAMEWORK_STATUS` | `"orchestrator"` | `"action-provider"` |

---

## Test results

| Suite                                        | Tests         |
| -------------------------------------------- | ------------- |
| `map-action-to-knowledge-document.test.ts`   | 3             |
| `action-registry-knowledge-provider.test.ts` | 9             |
| **Total monorepo**                           | **774** (+12) |

### Scenarios covered

| Scenario                              | Covered |
| ------------------------------------- | ------- |
| Action document mapping               | ✅      |
| Keyword query via orchestrator        | ✅      |
| Fuzzy query via orchestrator          | ✅      |
| Empty action registry                 | ✅      |
| Permission-filtered ActionRegistryDto | ✅      |
| Provider diagnostics                  | ✅      |
| Deterministic ordering                | ✅      |
| Knowledge DTO boundary enforcement    | ✅      |

### Coverage

| Scope     | Coverage         |
| --------- | ---------------- |
| All files | **91.22%** lines |

---

## Architecture compliance

| Rule                                             | Result |
| ------------------------------------------------ | ------ |
| Returns `actionRef` only — no `execute()`        | ✅     |
| Consumes Action Framework DTO — no duplication   | ✅     |
| Orchestrator handles keyword/fuzzy ranking       | ✅     |
| Filtered Action DTO before provider construction | ✅     |
| No navigation provider                           | ✅     |
| No persistence / semantic / AI                   | ✅     |
| No Action Framework execution pipeline changes   | ✅     |
| No `apps/web` wiring                             | ✅     |

---

## Technical debt

| ID         | Description                                    | Severity | Target       |
| ---------- | ---------------------------------------------- | -------- | ------------ |
| TD-DF07-01 | Provider not auto-registered during bootstrap  | Medium   | DF-015       |
| TD-DF07-02 | No Navigation provider                         | Expected | DF-008       |
| TD-DF07-03 | Toolbar actions not separately indexed         | Low      | Future       |
| TD-DF06-04 | Orchestrator not wired into server hydration   | Medium   | DF-015       |
| TD-DF04-01 | Bootstrap not wired into `Runtime.bootstrap()` | Medium   | DF-015 / ADR |

---

## Recommendations for DF-008

1. **Implement Workbench Navigation knowledge provider** — mirror Action provider pattern; project navigation DTO entries with `navigation` targets (not `actionRef`).

2. **Register on `platform.navigation`** — use T0 catalogue entry; do not duplicate Workbench route tables.

3. **Reuse orchestrator** — provider returns documents; orchestrator ranks; no orchestrator changes required.

4. **Keep Action provider unchanged** — DF-008 is navigation only.

5. **Do not wire `apps/web`** — DF-015 remains application integration.

---

## Quality gates

| Gate                 | Result          |
| -------------------- | --------------- |
| `pnpm lint`          | ✅ Pass         |
| `pnpm typecheck`     | ✅ Pass         |
| `pnpm build`         | ✅ Pass         |
| `pnpm test`          | ✅ Pass (774)   |
| `pnpm test:coverage` | ✅ Pass         |
| `pnpm test:e2e`      | ✅ Pass (19/19) |

---

## Stop condition

DF-007 complete. **Do not begin DF-008** until this report is reviewed and approved.

Next story upon approval: **DF-008 — Workbench navigation knowledge source**.

---

_DF-007 Completion Report — Sprint 005 Knowledge & Discovery Framework._
