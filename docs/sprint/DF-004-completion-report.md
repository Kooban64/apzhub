# DF-004 — Completion Report

> **Story:** DF-004 — Manifest-driven Knowledge Source registration  
> **Sprint:** SPR-005 — Knowledge & Discovery Framework  
> **Date:** 2026-06-28  
> **Status:** Complete — **await review before DF-005**

---

## Objective

Implement manifest-driven Knowledge Source registration. The Knowledge Framework discovers and registers Knowledge Sources from existing platform manifests. No indexing, search, persistence, provider execution, or orchestration.

---

## Acceptance criteria

| Criterion                           | Status                                                                         |
| ----------------------------------- | ------------------------------------------------------------------------------ |
| `knowledge.sources` manifest schema | ✅ `packages/platform-runtime/src/manifest-engine/schemas/knowledge.ts`        |
| Manifest validation                 | ✅ Zod strict schema + `knowledge-manifest.test.ts`                            |
| Knowledge Source extraction         | ✅ `extractKnowledgeSourcesFromCapabilities`                                   |
| Atomic registration                 | ✅ `registerManySourcesAtomic` via `populateKnowledgeRegistryFromCapabilities` |
| Bootstrap registration              | ✅ `bootstrapKnowledgeRegistry`                                                |
| Registry diagnostics                | ✅ `buildKnowledgeRegistryBootstrapDiagnostics`                                |
| Reuse manifest infrastructure       | ✅ `optionalKnowledgeFields` on envelope schemas                               |
| No Runtime orchestrator changes     | ✅ Bootstrap callable; not wired to orchestrator                               |
| No indexing / search / persistence  | ✅ Verified                                                                    |
| Quality gates pass                  | ✅                                                                             |
| Owner review before DF-005          | ⏳ Pending                                                                     |

---

## Implementation summary

### Platform-runtime (`@apzhub/platform-runtime`)

| Component                 | Path                                                                                             |
| ------------------------- | ------------------------------------------------------------------------------------------------ |
| Knowledge manifest schema | `src/manifest-engine/schemas/knowledge.ts`                                                       |
| Envelope integration      | `schemas/component.ts`, `module.ts`, `service.ts`, `integration.ts`, `event.ts`, `extensions.ts` |
| Schema tests              | `src/manifest-engine/knowledge-manifest.test.ts`                                                 |

### Knowledge Discovery Framework (`@apzhub/knowledge-discovery-framework`)

| Component                 | Path                                                     |
| ------------------------- | -------------------------------------------------------- |
| Manifest → source mapping | `src/extraction/map-knowledge-manifest.ts`               |
| Capability extraction     | `src/extraction/extract-knowledge-sources.ts`            |
| Atomic population         | `src/extraction/populate-knowledge-registry.ts`          |
| Platform T0 catalogue     | `src/catalogue/platform-knowledge-source-catalogue.ts`   |
| Catalogue registration    | `src/catalogue/register-platform-knowledge-sources.ts`   |
| Bootstrap entry           | `src/server/bootstrap-knowledge-registry.ts`             |
| Bootstrap diagnostics     | `src/server/knowledge-registry-bootstrap-diagnostics.ts` |

### Bootstrap flow

```text
registerPlatformKnowledgeSourceCatalogue()
        ↓
populateKnowledgeRegistryFromCapabilities()
        ↓
registerManySourcesAtomic()
        ↓
buildKnowledgeRegistryBootstrapDiagnostics()
```

### Status constants

| Constant                               | Previous     | Current       |
| -------------------------------------- | ------------ | ------------- |
| `KNOWLEDGE_DISCOVERY_FRAMEWORK_STATUS` | `"registry"` | `"bootstrap"` |
| `KNOWLEDGE_DISCOVERY_SERVER_STATUS`    | `"scaffold"` | `"bootstrap"` |

---

## Deliverables

| Document                    | Path                                                                                     |
| --------------------------- | ---------------------------------------------------------------------------------------- |
| Manifest specification      | [SPR-005-KDF-knowledge-manifest.md](../specs/SPR-005-KDF-knowledge-manifest.md)          |
| Bootstrap specification     | [SPR-005-KDF-knowledge-bootstrap.md](../specs/SPR-005-KDF-knowledge-bootstrap.md)        |
| Registry relationship model | [knowledge-registry-relationship.md](../architecture/knowledge-registry-relationship.md) |
| Completion report           | This document                                                                            |

---

## Test results

| Suite                                         | Tests         |
| --------------------------------------------- | ------------- |
| `knowledge-manifest.test.ts`                  | 4             |
| `extract-knowledge-sources.test.ts`           | 8             |
| `bootstrap-knowledge-registry.test.ts`        | 3             |
| `register-platform-knowledge-sources.test.ts` | 1             |
| Updated package smoke / DI tests              | 4             |
| **Total monorepo**                            | **730** (+16) |

### Coverage

| Scope                                             | Coverage           |
| ------------------------------------------------- | ------------------ |
| All files                                         | **90.97%** lines   |
| `knowledge-discovery-framework/src/registry/**`   | ≥85% threshold met |
| `knowledge-discovery-framework/src/**`            | ≥80% threshold met |
| `knowledge-discovery-framework/src/extraction/**` | **95.39%** lines   |

---

## Architecture compliance

| Rule                                                  | Result |
| ----------------------------------------------------- | ------ |
| Knowledge Sources consume manifests — references only | ✅     |
| No Action / Navigation / Capability duplication       | ✅     |
| Runtime remains source of truth                       | ✅     |
| Registry Pattern — registration not execution         | ✅     |
| No provider `query()` invocation                      | ✅     |
| No search / index / persist                           | ✅     |
| No Runtime orchestrator pipeline changes              | ✅     |
| Atomic registration on failure                        | ✅     |

---

## Technical debt

| ID         | Description                                                   | Severity | Target             |
| ---------- | ------------------------------------------------------------- | -------- | ------------------ |
| TD-DF04-01 | Bootstrap not wired into `Runtime.bootstrap()`                | Medium   | DF-015 / ADR       |
| TD-DF04-02 | No server DTO permission filter                               | Medium   | DF-005             |
| TD-DF04-03 | T0 sources report `degraded` without providers                | Low      | DF-007, DF-008     |
| TD-DF04-04 | `extraction` branch coverage 77.77% — error rethrow path      | Low      | DF-006+            |
| TD-DF04-05 | No YAML fixture directory under `testing/fixtures/knowledge/` | Low      | DF-017             |
| TD-DF04-06 | E2E auth `signIn` helper occasionally flaky on first run      | Low      | Test infra         |
| TD-DF03-04 | Deprecated `KnowledgeRegistryDuplicateIssue`                  | Low      | DF-017             |
| TD-DF03-07 | `capability-registry` coverage threshold 94% baseline         | Low      | Platform test debt |

Resolved from DF-003:

| ID         | Resolution                                                    |
| ---------- | ------------------------------------------------------------- |
| TD-DF03-01 | Manifest extraction implemented                               |
| TD-DF03-06 | Bootstrap diagnostics use `validationIssueCount` via registry |

---

## Recommendations for DF-005

1. **Implement `KnowledgeSourceRegistryDto`** — serialisable server type mirroring Action Framework AF-005 filter pattern.

2. **Add `filterKnowledgeSourceRegistryDto(dto, permissionAdapter)`** — strip disallowed sources before client hydration; no provider execution.

3. **Export from `/server` subpath** — alongside existing `bootstrapKnowledgeRegistry`.

4. **Do not wire `apps/web` yet** — DF-015 remains the application integration story.

5. **Do not add orchestrator or providers** — DF-005 is filter DTO only; providers belong in DF-007+.

6. **Extend bootstrap diagnostics** — optional `filteredCount` field once DTO filter exists.

---

## Quality gates

| Gate                 | Result           |
| -------------------- | ---------------- |
| `pnpm lint`          | ✅ Pass          |
| `pnpm typecheck`     | ✅ Pass          |
| `pnpm build`         | ✅ Pass          |
| `pnpm test`          | ✅ Pass (730)    |
| `pnpm test:coverage` | ✅ Pass (90.97%) |
| `pnpm test:e2e`      | ✅ Pass (19/19)  |

---

## Stop condition

DF-004 complete. **Do not begin DF-005** until this report is reviewed and approved.

Next story upon approval: **DF-005 — Server filter DTO**.

---

_DF-004 Completion Report — Sprint 005 Knowledge & Discovery Framework._
