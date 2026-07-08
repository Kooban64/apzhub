# DF-002 — Completion Report

> **Story:** DF-002 — Knowledge & Discovery Framework package scaffold  
> **Sprint:** SPR-005 — Knowledge & Discovery Framework  
> **Date:** 2026-06-28  
> **Status:** Complete — **await review before DF-003**

---

## Objective

Create the `@apzhub/knowledge-discovery-framework` package — structure, public interfaces, domain model, dependency injection, and three-layer architecture documentation. Scaffold only — no search, indexing, persistence, or production knowledge sources.

---

## Acceptance criteria

| Criterion                                                                            | Status         |
| ------------------------------------------------------------------------------------ | -------------- |
| Package `@apzhub/knowledge-discovery-framework` in monorepo                          | ✅             |
| Repurpose `packages/search` per ADR-0027                                             | ✅             |
| Exports: `.`, `./server`, `./react`                                                  | ✅             |
| `KnowledgeSource`, `KnowledgeDocument`, `KnowledgeQuery`, `KnowledgeResult`          | ✅             |
| `KnowledgeProvider`, `KnowledgeRegistry`, `KnowledgeContext`, `KnowledgeDiagnostics` | ✅             |
| DI via `createKnowledgeDiscoveryContext()`                                           | ✅             |
| Three-layer architecture documented                                                  | ✅             |
| No search implementation                                                             | ✅             |
| No indexing / persistence / vector / AI                                              | ✅             |
| No Runtime registry duplication                                                      | ✅             |
| Package, interface, DI, diagnostics tests                                            | ✅             |
| Quality gates pass                                                                   | ✅ (see below) |
| Owner review before DF-003                                                           | ⏳ Pending     |

---

## Files added / changed

```text
packages/knowledge-discovery-framework/          (renamed from packages/search)
├── package.json
├── tsconfig.json
├── README.md
└── src/
    ├── index.ts
    ├── index.test.ts
    ├── status.ts
    ├── server.ts
    ├── server.test.ts
    ├── types/
    │   ├── knowledge-source.ts
    │   ├── knowledge-document.ts
    │   ├── knowledge-query.ts
    │   ├── knowledge-result.ts
    │   ├── knowledge-context.ts
    │   ├── knowledge-diagnostics.ts
    │   ├── types.test.ts
    │   └── index.ts
    ├── provider/
    │   ├── knowledge-provider.ts
    │   ├── scaffold-knowledge-provider.ts
    │   └── index.ts
    ├── registry/
    │   ├── knowledge-registry.ts
    │   ├── default-knowledge-registry.ts
    │   ├── placeholder-knowledge-registry.ts
    │   ├── freeze.ts
    │   └── index.ts
    ├── di/
    │   ├── knowledge-discovery-context.ts
    │   └── index.ts
    └── react/
        ├── index.ts
        └── index.test.ts
```

### Monorepo config updated

| File                 | Change                                                                         |
| -------------------- | ------------------------------------------------------------------------------ |
| `tsconfig.base.json` | Replaced `@apzhub/search` aliases with `@apzhub/knowledge-discovery-framework` |
| `vitest.config.ts`   | Aliases, coverage thresholds, index excludes                                   |

### Documentation

| Document                                                                                                   | Purpose                             |
| ---------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| [knowledge-discovery-three-layer-model.md](../architecture/knowledge-discovery-three-layer-model.md)       | Sources · Index · Experience layers |
| [knowledge-discovery-domain-model.md](../architecture/knowledge-discovery-domain-model.md)                 | Type reference and DF-001 mapping   |
| [packages/knowledge-discovery-framework/README.md](../../packages/knowledge-discovery-framework/README.md) | Package guide                       |

---

## Public API summary

| Symbol                                 | Role                                |
| -------------------------------------- | ----------------------------------- |
| `KNOWLEDGE_DISCOVERY_FRAMEWORK_STATUS` | `"scaffold"`                        |
| `KNOWLEDGE_ARCHITECTURE_LAYERS`        | Three-layer identifiers             |
| `KNOWLEDGE_ACTIVE_LAYER`               | `"knowledge-sources"`               |
| `createKnowledgeDiscoveryContext()`    | DI composition root                 |
| `DefaultKnowledgeRegistry`             | In-memory register/list/diagnostics |
| `PlaceholderKnowledgeRegistry`         | No-op scaffold                      |
| `ScaffoldKnowledgeProvider`            | Returns `not_implemented`           |
| Domain types                           | See domain model doc                |

---

## Architecture compliance

| Rule                                                             | Result |
| ---------------------------------------------------------------- | ------ |
| Platform 2.0 not redesigned                                      | ✅     |
| Runtime / Workbench / Action Framework unchanged                 | ✅     |
| No new execution pipeline                                        | ✅     |
| Sources consume registries (documented) — no duplication in code | ✅     |
| Registry Pattern — registration not execution                    | ✅     |
| No React in core package.json                                    | ✅     |

---

## Technical debt

| ID         | Description                                                                                               | Severity | Target                                        |
| ---------- | --------------------------------------------------------------------------------------------------------- | -------- | --------------------------------------------- |
| TD-DF02-01 | `@apzhub/search` name retired — update stale references in `platform-runtime.md` and MILESTONE-004 review | Low      | DF-017                                        |
| TD-DF02-02 | `DefaultKnowledgeRegistry` duplicate detection reports but does not fail bootstrap                        | Low      | DF-003 (align with Registry fail-fast policy) |
| TD-DF02-03 | No manifest `knowledge.sources` extraction                                                                | Medium   | DF-004                                        |
| TD-DF02-04 | No server DTO filter                                                                                      | Medium   | DF-005                                        |
| TD-DF02-05 | Provider `query()` scaffold only — orchestrator deferred                                                  | Expected | DF-006                                        |
| TD-DF02-06 | React subpath empty of hooks                                                                              | Expected | DF-010                                        |
| TD-DF02-07 | `apps/web` not wired — no `transpilePackages` entry yet                                                   | Expected | DF-015                                        |

---

## Recommendations for DF-003

1. **Extend `DefaultKnowledgeRegistry`** with validation on register (required fields, id format), `registerManyAtomic`, and fail-fast option aligned with [ADR-0013](../adr/ADR-0013-registry-fail-fast-policy.md).

2. **Rename story scope alignment** — backlog DF-003 title references `KnowledgeSourceRegistry`; code uses `KnowledgeRegistry`. Keep `KnowledgeRegistry` as public API; document alias in spec index.

3. **Add `knowledge-source-registry.test.ts`** with ≥85% coverage on registry module per backlog acceptance criteria.

4. **Do not add platform-runtime dependencies** until DF-004 manifest extraction requires them.

5. **Single PR for DF-003** — registry hardening only; no orchestrator or UI.

---

## Quality gates

| Gate                 | Result                                                           |
| -------------------- | ---------------------------------------------------------------- |
| `pnpm lint`          | ✅ Pass                                                          |
| `pnpm typecheck`     | ✅ Pass                                                          |
| `pnpm build`         | ✅ Pass                                                          |
| `pnpm test`          | ✅ Pass (686 tests — +14 new)                                    |
| `pnpm test:coverage` | ✅ Pass (91.04%)                                                 |
| `pnpm test:e2e`      | ✅ Pass (19/19 — Chromium install required in fresh environment) |

---

## Stop condition

DF-002 complete. **Do not begin DF-003** until this report is reviewed and approved.

Next story upon approval: **DF-003 — KnowledgeRegistry core** (backlog: KnowledgeSourceRegistry hardening).

---

_DF-002 Completion Report — Sprint 005 Knowledge & Discovery Framework._
