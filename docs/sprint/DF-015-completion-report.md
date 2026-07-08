# DF-015 — Completion Report

> **Story:** DF-015 — Knowledge Service + application integration  
> **Sprint:** SPR-005 — Knowledge & Discovery Framework  
> **Date:** 2026-07-03  
> **Status:** Complete — **await review before DF-016**

---

## Objective

Introduce the public **Knowledge Service** API as the stable client boundary between Knowledge Experiences and query implementation, and perform the first `apps/web` integration.

---

## Acceptance criteria

| Criterion                                                    | Status                              |
| ------------------------------------------------------------ | ----------------------------------- |
| `KnowledgeService` interface                                 | ✅                                  |
| `DefaultKnowledgeService`                                    | ✅                                  |
| `createKnowledgeService()`                                   | ✅                                  |
| `useKnowledgeService()`                                      | ✅                                  |
| `KnowledgeQueryClient` internal to service                   | ✅                                  |
| Experiences consume Knowledge Service                        | ✅ overlay + palette knowledge mode |
| `apps/web` hydration + provider wiring                       | ✅                                  |
| Health diagnostics (framework, registry, service, query)     | ✅                                  |
| Ranking / providers / registries / query behaviour unchanged | ✅                                  |
| Quality gates pass                                           | ✅                                  |
| Owner review before DF-016                                   | ⏳ Pending                          |

---

## Implementation summary

### Knowledge Service (`packages/knowledge-discovery-framework/src/client/service/`)

| Export                                  | Role                                  |
| --------------------------------------- | ------------------------------------- |
| `KnowledgeService`                      | Public query + diagnostics interface  |
| `DefaultKnowledgeService`               | Wraps internal `KnowledgeQueryClient` |
| `createKnowledgeService()`              | Factory                               |
| `createKnowledgeServiceFromHydration()` | Orchestrator wiring for apps          |
| `useKnowledgeService()`                 | React hook for Experience surfaces    |
| `buildKnowledgeServiceHealthSummary()`  | Platform health mapper                |

### Application integration (`apps/web`)

| Module                                | Role                                              |
| ------------------------------------- | ------------------------------------------------- |
| `lib/knowledge-hydration.ts`          | Server DTO hydration + health summary             |
| `lib/use-app-knowledge-service.ts`    | Client service from hydrated DTOs                 |
| `(platform)/layout.tsx`               | Parallel knowledge DTO load                       |
| `action-workbench-shell-provider.tsx` | `KnowledgeDiscoveryProvider` + service            |
| `app/api/health/route.ts`             | `knowledge` field on health response              |
| `next.config.ts`                      | Transpile `@apzhub/knowledge-discovery-framework` |

### Status constant

| Constant                               | Previous             | Current     |
| -------------------------------------- | -------------------- | ----------- |
| `KNOWLEDGE_DISCOVERY_FRAMEWORK_STATUS` | `"ranking-scaffold"` | `"service"` |

---

## Architecture

```text
Knowledge Experiences
        ↓
useKnowledgeService()
        ↓
Knowledge Service
        ↓
Knowledge Query Client (internal)
        ↓
Knowledge Discovery Orchestrator
```

---

## Deliverables

| Document                        | Path                                                                              |
| ------------------------------- | --------------------------------------------------------------------------------- |
| Knowledge Service specification | [SPR-005-KDF-knowledge-service.md](../specs/SPR-005-KDF-knowledge-service.md)     |
| Updated Query API spec          | [SPR-005-KDF-knowledge-query-api.md](../specs/SPR-005-KDF-knowledge-query-api.md) |
| Updated architecture            | [knowledge-views-model.md](../architecture/knowledge-views-model.md)              |
| Completion report               | This document                                                                     |

---

## Test results

| Suite                            | Tests               | Status |
| -------------------------------- | ------------------- | ------ |
| `knowledge-service.test.ts`      | 3                   | ✅     |
| `use-knowledge-service.test.tsx` | 2                   | ✅     |
| `knowledge-hydration.test.ts`    | 1                   | ✅     |
| Monorepo total                   | **869** (170 files) | ✅     |
| Playwright E2E                   | **19**              | ✅     |

### Coverage

| Scope                  | Statements | Branches | Functions | Lines  |
| ---------------------- | ---------- | -------- | --------- | ------ |
| Monorepo (`All files`) | **91.59%** | 87.46%   | 91.94%    | 91.59% |
| `client/service/`      | **96.8%**  | 78.94%   | 100%      | 96.8%  |

---

## Quality gates

| Gate                 | Result               |
| -------------------- | -------------------- |
| `pnpm lint`          | ✅ Pass              |
| `pnpm typecheck`     | ✅ Pass              |
| `pnpm build`         | ✅ Pass              |
| `pnpm test`          | ✅ 869 passed        |
| `pnpm test:coverage` | ✅ 91.59% statements |
| `pnpm test:e2e`      | ✅ 19 passed         |

---

## Technical debt

| Item                                                        | Notes                                                            |
| ----------------------------------------------------------- | ---------------------------------------------------------------- |
| `useKnowledgeQuery()` deprecated but retained               | Backward compatibility for tests and docs                        |
| Overlay / header not mounted in `DesktopShell`              | Experiences wired via provider; UI activation deferred           |
| In-process orchestrator only                                | HTTP query client adapter for edge deployment future work        |
| `hydrateKnowledgeRegistry()` reloads command/workbench DTOs | Acceptable for DF-015; optimise with shared layout cache later   |
| Provider register helpers in `test-fixtures.ts`             | Production-used; relocate to provider modules in future refactor |

---

## Recommendation for DF-016

Add Playwright E2E coverage:

1. Authenticated shell receives `KnowledgeDiscoveryProvider` with live service
2. Health endpoint includes `knowledge` field with `queryAvailable: true`
3. Knowledge overlay or palette knowledge mode query + selection delegation (when UI enabled)

---

## Stop condition

**Do not begin DF-016** until:

1. This completion report is reviewed and approved
2. Owner confirms DF-015 acceptance criteria

---

_DF-015 Completion Report — SPR-005 Knowledge & Discovery Framework._
