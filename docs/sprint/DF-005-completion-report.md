# DF-005 — Completion Report

> **Story:** DF-005 — Server filter DTO  
> **Sprint:** SPR-005 — Knowledge & Discovery Framework  
> **Date:** 2026-06-28  
> **Status:** Complete — **await review before DF-006**

---

## Objective

Implement the server-facing Knowledge Registry DTO — a read-only, versioned projection with permission filtering and hydration diagnostics. Mirrors the Action Framework pattern. No application wiring, provider execution, or search.

---

## Acceptance criteria

| Criterion                                            | Status                                           |
| ---------------------------------------------------- | ------------------------------------------------ |
| `KnowledgeSourceRegistryDto` serialisable type       | ✅                                               |
| DTO mapping from registry                            | ✅ `mapKnowledgeSourceRegistryDto`               |
| DTO validation                                       | ✅ `validateKnowledgeSourceRegistryDto`          |
| DTO versioning (`schemaVersion`, `frameworkVersion`) | ✅ From first implementation                     |
| Permission filtering                                 | ✅ `filterKnowledgeSourceRegistryDto`            |
| Hydration diagnostics                                | ✅ `buildKnowledgeDiscoveryHydrationDiagnostics` |
| Exported from `/server` subpath                      | ✅                                               |
| No provider execution / search / persistence         | ✅ Verified                                      |
| Quality gates pass                                   | ✅                                               |
| Owner review before DF-006                           | ⏳ Pending                                       |

---

## Implementation summary

### Server API (`@apzhub/knowledge-discovery-framework/server`)

| Export                                         | Purpose                                            |
| ---------------------------------------------- | -------------------------------------------------- |
| `KnowledgeSourceRegistryDto`                   | Versioned serialisable payload                     |
| `KnowledgeSourceDescriptorDto`                 | Client-safe source descriptor                      |
| `mapKnowledgeSourceRegistryDto`                | Registry → unfiltered DTO                          |
| `createEmptyKnowledgeSourceRegistryDto`        | Empty DTO factory                                  |
| `filterKnowledgeSourceRegistryDto`             | Permission filter via `WorkbenchPermissionAdapter` |
| `validateKnowledgeSourceRegistryDto`           | Unknown payload validation                         |
| `buildKnowledgeDiscoveryHydrationDiagnostics`  | Registered vs filtered counts                      |
| `KNOWLEDGE_SOURCE_REGISTRY_DTO_SCHEMA_VERSION` | `1`                                                |

### Status constants

| Constant                               | Previous      | Current    |
| -------------------------------------- | ------------- | ---------- |
| `KNOWLEDGE_DISCOVERY_FRAMEWORK_STATUS` | `"bootstrap"` | `"filter"` |
| `KNOWLEDGE_DISCOVERY_SERVER_STATUS`    | `"bootstrap"` | `"filter"` |

### Dependency added

`@apzhub/workbench-framework` — for `WorkbenchPermissionAdapter` (mirrors command-framework).

---

## Deliverables

| Document              | Path                                                                                                  |
| --------------------- | ----------------------------------------------------------------------------------------------------- |
| DTO specification     | [SPR-005-KDF-knowledge-source-registry-dto.md](../specs/SPR-005-KDF-knowledge-source-registry-dto.md) |
| Knowledge Views model | [knowledge-views-model.md](../architecture/knowledge-views-model.md)                                  |
| Completion report     | This document                                                                                         |

---

## Test results

| Suite                                               | Tests         |
| --------------------------------------------------- | ------------- |
| `map-knowledge-source-registry-dto.test.ts`         | 2             |
| `filter-knowledge-source-registry-dto.test.ts`      | 5             |
| `validate-knowledge-source-registry-dto.test.ts`    | 6             |
| `knowledge-discovery-hydration-diagnostics.test.ts` | 3             |
| Updated status smoke tests                          | 4             |
| **Total monorepo**                                  | **746** (+16) |

### Coverage

| Scope                                  | Coverage           |
| -------------------------------------- | ------------------ |
| All files                              | **91.01%** lines   |
| `knowledge-discovery-framework/src/**` | ≥80% threshold met |

---

## Architecture compliance

| Rule                                            | Result |
| ----------------------------------------------- | ------ |
| DTO is read-only registry projection            | ✅     |
| Server authoritative                            | ✅     |
| Versioned (`schemaVersion`, `frameworkVersion`) | ✅     |
| Permission delegated to Workbench adapter       | ✅     |
| No `provider.query()` invocation                | ✅     |
| No search / index / persist                     | ✅     |
| No `apps/web` wiring                            | ✅     |
| Registry Pattern — registration not execution   | ✅     |

---

## Technical debt

| ID         | Description                                                      | Severity | Target         |
| ---------- | ---------------------------------------------------------------- | -------- | -------------- |
| TD-DF05-01 | DTO not wired into `apps/web` hydration                          | Medium   | DF-015         |
| TD-DF05-02 | Client-side `validateKnowledgeSourceRegistryDto` not on `/react` | Low      | DF-010         |
| TD-DF05-03 | No orchestrator                                                  | Expected | DF-006         |
| TD-DF05-04 | Bootstrap does not return DTO — callers compose map + filter     | Low      | DF-015         |
| TD-DF04-01 | Bootstrap not wired into `Runtime.bootstrap()`                   | Medium   | DF-015 / ADR   |
| TD-DF04-03 | T0 sources report `degraded` without providers                   | Low      | DF-007, DF-008 |

Resolved from DF-004:

| ID         | Resolution                               |
| ---------- | ---------------------------------------- |
| TD-DF04-02 | Server DTO permission filter implemented |

---

## Recommendations for DF-006

1. **Implement `KnowledgeDiscoveryOrchestrator`** — `query({ text, context, permissions })` dispatching registered providers in priority order.

2. **Use filtered DTO source list** as orchestrator input boundary — only query sources visible after permission filter.

3. **Return `KnowledgeDocument[]`** — entity references with action/navigation targets only; no execution.

4. **Add keyword + fuzzy matching** — reuse Action Registry search patterns where appropriate.

5. **Do not wire `apps/web`** — DF-015 remains application integration.

6. **Do not implement providers in DF-006** — use mock providers in orchestrator tests; real Action/Navigation providers remain DF-007/DF-008.

---

## Quality gates

| Gate                 | Result          |
| -------------------- | --------------- |
| `pnpm lint`          | ✅ Pass         |
| `pnpm typecheck`     | ✅ Pass         |
| `pnpm build`         | ✅ Pass         |
| `pnpm test`          | ✅ Pass (746)   |
| `pnpm test:coverage` | ✅ Pass         |
| `pnpm test:e2e`      | ✅ Pass (19/19) |

---

## Stop condition

DF-005 complete. **Do not begin DF-006** until this report is reviewed and approved.

Next story upon approval: **DF-006 — KnowledgeDiscoveryOrchestrator (keyword + fuzzy)**.

---

_DF-005 Completion Report — Sprint 005 Knowledge & Discovery Framework._
