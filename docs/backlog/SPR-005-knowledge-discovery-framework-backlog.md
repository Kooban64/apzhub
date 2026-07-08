# SPR-005 — Knowledge & Discovery Framework Engineering Backlog

> **Sprint:** SPR-005 — Knowledge & Discovery Framework  
> **Milestone:** 5 — Knowledge & Discovery Framework  
> **Mode:** Sprint 005 closed — Milestone 5 complete; Platform 3.0 baseline established  
> **Authority:** [Platform Roadmap v2](../roadmap/APZHUB-Platform-Roadmap-v2.md) · [Document 020](../020-unified-search-knowledge-discovery-framework.md) · [Platform Reference Architecture](../architecture/APZHUB-Platform-Reference-Architecture.md) · [Knowledge Source Spec](../specs/SPR-005-KDF-knowledge-sources.md)

---

## Development workflow

Architecture redesign is not permitted. All stories extend Platform 2.0. Baseline changes require ADR.

```text
Product Requirement (Document 020)
        ↓
Technical Specification
        ↓
Implementation
        ↓
Code Review
        ↓
Merge
        ↓
Release
```

### Story process

1. Technical Specification — `docs/specs/` or story appendix
2. Implementation — single PR, single concern
3. Tests — unit / integration / E2E per story
4. Documentation — guides, CHANGELOG if user-visible
5. Review — baseline + acceptance criteria
6. Close — completion report; owner review; next story

**Rule:** Complete one story before beginning the next.

### Effort scale

| Label | Estimate  |
| ----- | --------- |
| S     | 0.5–1 day |
| M     | 1–2 days  |
| L     | 2–3 days  |

---

## Knowledge & Discovery Framework vision

The Knowledge & Discovery Framework provides a **unified knowledge layer** across APZHUB — broader than search alone. It **consumes existing registries** — Action Registry, Workbench navigation registry, capability metadata — without introducing a new execution pipeline.

| Capability                 | Sprint scope      |
| -------------------------- | ----------------- |
| Keyword search             | ✅ Foundation     |
| Fuzzy search               | ✅ Foundation     |
| Semantic search            | ⏳ Interface stub |
| AI-assisted discovery      | ⏳ Interface stub |
| Recently used              | ✅ Scaffold       |
| Frequently used            | ✅ Scaffold       |
| Pinned items               | ⏳ Interface stub |
| Recommendations            | ⏳ Interface stub |
| Cross-capability discovery | ✅ Provider model |

**Constraint:** Knowledge result selections route to existing Action Framework `execute()` or Workbench navigation — no parallel execution path ([ADR-0029](../adr/ADR-0029-knowledge-discovery-execution-routing.md)).

---

## Story map

```text
DF-001 Knowledge Source Architecture ✅
    ↓
DF-002 Package scaffold
    ↓
DF-003 KnowledgeSourceRegistry core
    ↓
DF-004 Manifest `knowledge.sources` ── DF-005 Server filter DTO
    ↓
DF-006 KnowledgeDiscoveryOrchestrator (keyword + fuzzy)
    ↓
DF-007 Action Registry knowledge source ── DF-008 Workbench navigation knowledge source
    ↓
DF-009 Ranking scaffold (recency + frequency hooks)
    ↓
DF-010 Client hydration + useKnowledgeRegistry
    ↓
DF-011 Header search UI ── DF-012 Knowledge discovery overlay
    ↓
DF-013 Palette integration (commands as knowledge entities)
    ↓
DF-014 Semantic / AI knowledge source stubs
    ↓
DF-015 Application integration (apps/web)
    ↓
DF-016 E2E tests
    ↓
DF-017 Documentation
    ↓
DF-018 Sprint closeout
```

---

## DF-001 — Knowledge Source Architecture ✅

### Objective

Define the Knowledge Source Architecture — identify and model knowledge sources that participate in the Knowledge & Discovery Framework. Architecture and ADRs only; no search or indexing implementation.

### Scope

- Knowledge Source specification ([SPR-005-KDF-knowledge-sources.md](../specs/SPR-005-KDF-knowledge-sources.md))
- Knowledge Source taxonomy (tiers T0–T4, source kinds, entity kinds)
- Registry integration model (consume Action, Workbench, Capability registries — no duplication)
- Indexing strategy (documentation only)
- Search strategy overview (documentation only)
- AI extension points (documentation only)
- ADR-0027: `@apzhub/knowledge-discovery-framework` package (repurpose `@apzhub/search` shell)
- ADR-0028: Knowledge Source model and taxonomy
- ADR-0029: Knowledge discovery execution routing (no new pipeline)
- Technical spec index `docs/specs/SPR-005-spec-index.md`

### Acceptance criteria

- [x] ADRs 0027–0029 authored
- [x] Knowledge Source specification complete
- [x] Taxonomy and registry integration documented
- [x] Indexing and search strategy documented (no implementation)
- [x] AI extension points documented
- [x] Spec index lists all DF stories
- [x] Execution routing explicitly forbids new pipeline
- [x] Registry Pattern compliance documented
- [x] No production code
- [ ] Owner review before DF-002

### Dependencies

- Platform 2.0 baseline approved ✅
- Sprint 005 approved ✅

### Tests

- N/A (documentation only)
- Quality gates remain green (no regression)

### Estimated effort

**M**

### Completion report

[DF-001-completion-report.md](../sprint/DF-001-completion-report.md)

---

## DF-002 — Package scaffold ✅

### Objective

Create Knowledge & Discovery Framework package — domain model, registry scaffold, DI, and three-layer architecture documentation.

### Scope

- Package: `@apzhub/knowledge-discovery-framework` ([ADR-0027](../adr/ADR-0027-knowledge-discovery-framework-package.md))
- Domain types: KnowledgeSource, KnowledgeDocument, KnowledgeQuery, KnowledgeResult, KnowledgeProvider, KnowledgeRegistry, KnowledgeContext, KnowledgeDiagnostics
- `src/index.ts`, `src/server.ts`, `src/react/index.ts`
- DI: `createKnowledgeDiscoveryContext()`
- Three-layer architecture documentation

### Acceptance criteria

- [x] Package builds and typechecks
- [x] Domain model and exports compile
- [x] Workspace dependency possible
- [x] No search, indexing, persistence, or production sources
- [x] Quality gates pass
- [ ] Owner review before DF-003

### Dependencies

- DF-001 ✅

### Tests

- Package, interface, DI, diagnostics tests — 14 new tests

### Estimated effort

**S**

### Completion report

[DF-002-completion-report.md](../sprint/DF-002-completion-report.md)

---

## DF-003 — KnowledgeRegistry core ✅

### Objective

Complete the Knowledge Registry — validation, duplicate detection, atomic registration, diagnostics, and metadata.

### Scope

- `DefaultKnowledgeRegistry` — full implementation
- Validation, duplicate fail-fast, atomic batch registration
- `KnowledgeSourceMetadata`, `KnowledgeRegistryMetadata`, `KnowledgeDiagnostics`
- Registry specification and metadata specification
- KnowledgeDocument → KnowledgeResource evolution note (docs only)

### Acceptance criteria

- [x] Registry validation and duplicate detection
- [x] Atomic registration APIs
- [x] Metadata and diagnostics exposed
- [x] Registry does not invoke providers
- [x] No search, index, persist, orchestration
- [x] Tests ≥85% on registry module
- [x] Quality gates pass
- [x] Owner review before DF-004

### Completion report

[DF-003-completion-report.md](../sprint/DF-003-completion-report.md)

---

## DF-004 — Manifest `knowledge.sources` ✅

### Objective

Extend Manifest Engine to declare `knowledge.sources`; extract and register at bootstrap.

### Scope

- Zod schema for `knowledge.sources` manifest block
- Extraction helper: capability records → Knowledge Source descriptors
- Bootstrap: platform catalogue + manifest extraction + atomic registration
- Fixture manifests for tests

### Acceptance criteria

- [x] Valid manifests extract sources
- [x] Invalid manifests fail validation with actionable errors
- [x] Extraction unit tests with fixtures
- [x] No changes to Runtime orchestrator pipeline

### Completion report

[DF-004-completion-report.md](../sprint/DF-004-completion-report.md)

---

## DF-005 — Server filter DTO ✅

### Objective

Permission-filter knowledge source DTO server-side before client hydration.

### Scope

- `KnowledgeSourceRegistryDto` serialisable type
- `filterKnowledgeSourceRegistryDto(dto, permissionAdapter)`
- `buildKnowledgeDiscoveryHydrationDiagnostics()`
- Mirror Action Framework filter pattern (AF-005)

### Acceptance criteria

- [x] Filtered DTO strips disallowed sources
- [x] Diagnostics report registered vs filtered counts
- [x] Unit tests for filter edge cases
- [x] Exported from `@apzhub/knowledge-discovery-framework/server`

### Completion report

[DF-005-completion-report.md](../sprint/DF-005-completion-report.md)

---

## DF-006 — KnowledgeDiscoveryOrchestrator (keyword + fuzzy) ✅

### Objective

Implement query orchestration across registered knowledge sources with keyword and fuzzy matching.

### Scope

- `KnowledgeDiscoveryOrchestrator.query({ text, context, limit })`
- Provider dispatch in priority order
- Result merging and deduplication by document id
- Fuzzy scoring (Action Registry search pattern)

### Acceptance criteria

- [x] Keyword search returns ranked results
- [x] Fuzzy matching works on title and keywords
- [x] Empty query handled gracefully
- [x] Diagnostics on query duration and provider counts
- [x] No execution — returns knowledge documents with action/navigation references only

### Completion report

[DF-006-completion-report.md](../sprint/DF-006-completion-report.md)

---

## DF-007 — Action Registry knowledge source ✅

### Objective

Implement built-in T0 source that projects Action Registry entries as knowledge documents.

### Acceptance criteria

- [x] Platform and manifest actions appear in knowledge results
- [x] Results reference `actionRef` for existing `execute()` path
- [x] No duplicate Action Registry
- [x] Provider tests with fixture `ActionRegistryDto`

### Completion report

[DF-007-completion-report.md](../sprint/DF-007-completion-report.md)

---

## DF-008 — Workbench navigation knowledge source ✅

### Objective

Implement T0 source projecting Workbench navigation items as knowledge documents.

### Acceptance criteria

- [x] Activity bar workspaces discoverable by label
- [x] Sidebar items discoverable with parent/child metadata
- [x] Results carry `navigation` references for existing Workbench API
- [x] Provider tests with fixture `WorkbenchRegistryDto`

### Completion report

[DF-008-completion-report.md](../sprint/DF-008-completion-report.md)

---

## DF-009 — Ranking scaffold (recency + frequency) ✅

### Objective

Scaffold ranking hooks for recently used and frequently used entities.

### Scope (DF-009 delivered)

- `RankingEngine` interface and `DefaultRankingEngine`
- `RankingStrategy` abstraction
- Keyword and fuzzy strategies
- Orchestrator delegation (behaviour unchanged)

### Acceptance criteria

- [x] Ranking engine with deterministic strategies
- [x] Orchestrator delegates ranking
- [x] Ranking diagnostics exposed
- [x] Dependency injection via composition root
- [ ] Recency / frequency boost (deferred — extension point only)

### Completion report

[DF-009-completion-report.md](../sprint/DF-009-completion-report.md)

---

## DF-010 — Client hydration + useKnowledgeRegistry ✅

### Objective

Hydrate read-only client Knowledge Registry from server DTO; React provider and hook.

### Scope

- `createKnowledgeRegistryFromDto(dto)`
- `KnowledgeRegistryProvider` React context
- `useKnowledgeRegistry()` — sources, isReady, diagnostics, version metadata
- Client DTO validation before hydration
- Client diagnostics and synchronisation metadata

### Acceptance criteria

- [x] Server DTO hydrates client read-only view
- [x] Provider exposes hydrated registry (no query — deferred to DF-011+)
- [x] React hook tests with test provider
- [x] One-way hydration documented (no client registration)
- [ ] Owner review before DF-011

### Dependencies

- DF-005

### Tests

- `create-knowledge-registry-from-dto.test.ts`
- `use-knowledge-registry.test.tsx`

### Estimated effort

**M**

Completion report: [DF-010-completion-report.md](../sprint/DF-010-completion-report.md)

---

## DF-011 — Client Knowledge Query API ✅

### Objective

Implement client-side Knowledge Query API — presentation-agnostic query hook and orchestrator boundary integration.

### Scope

- `useKnowledgeQuery()` with lifecycle state
- `KnowledgeDiscoveryProvider` with query client DI
- `KnowledgeQueryClient` + orchestrator adapter
- Client query diagnostics
- No search UI

### Acceptance criteria

- [x] Query lifecycle (idle, loading, success, error)
- [x] Consumes hydrated registry without duplication
- [x] Orchestrator boundary via injected client
- [x] Hook and provider tests with mocked client
- [ ] Owner review before DF-012

### Dependencies

- DF-010

### Tests

- `execute-knowledge-query.test.ts`
- `create-knowledge-query-client-from-orchestrator.test.ts`
- `use-knowledge-query.test.tsx`

### Estimated effort

**M**

Completion report: [DF-011-completion-report.md](../sprint/DF-011-completion-report.md)

---

## DF-012 — Knowledge Overlay ✅

### Objective

Implement knowledge discovery results overlay (grouped results presentation).

### Scope

- `KnowledgeOverlay` + `WorkbenchKnowledgeOverlay` in `@apzhub/workspace`
- Grouped results by knowledge source
- Selection handler routes to Action `execute()` or Workbench navigation
- Loading, empty, and error states

### Acceptance criteria

- [x] Overlay renders grouped results
- [x] Action selection delegates via injected handlers (Action Framework)
- [x] Navigation selection delegates via injected handlers (Workbench)
- [x] No new execution pipeline introduced
- [x] Component + integration tests
- [ ] Owner review before DF-013

### Dependencies

- DF-010, DF-011

### Tests

- `knowledge-overlay.test.tsx`
- `workbench-knowledge-overlay.test.tsx`
- `group-knowledge-documents.test.ts`

### Estimated effort

**L**

Completion report: [DF-012-completion-report.md](../sprint/DF-012-completion-report.md)

---

## DF-013 — Palette integration ✅

### Objective

Integrate knowledge results with Command Palette — commands as knowledge entities without duplication.

### Scope

- Command Palette `mode="knowledge"` consumes `useKnowledgeQuery()`
- Reuses `groupKnowledgeDocuments()` and overlay selection delegation
- No duplicate action lists maintained in UI
- Document interaction model in spec

### Acceptance criteria

- [x] Single source of truth for action discoverability
- [x] Palette Ctrl+Shift+P behaviour preserved (commands mode default)
- [x] Knowledge palette and overlay share delegation model
- [x] Component + integration tests
- [ ] Owner review before DF-014

### Dependencies

- DF-007, DF-011, DF-012, Platform 2.0 Command Palette

### Tests

- `workbench-command-palette-knowledge.test.tsx`
- `map-knowledge-groups-to-palette-items.test.ts`

### Estimated effort

**M**

Completion report: [DF-013-completion-report.md](../sprint/DF-013-completion-report.md)

---

## DF-014 — Ranking strategy scaffolds ✅

### Objective

Extend the Ranking Engine with future ranking strategy scaffolding — no semantic, AI, or behavioural changes.

### Scope

- `SemanticRankingStrategy`, `RecencyRankingStrategy`, `FrequencyRankingStrategy`, `PersonalisationRankingStrategy`, `AIRerankingStrategy`
- Strategy diagnostics and `RankingStrategyRegistry`
- DI extension via `createKnowledgeDiscoveryContext().rankingStrategyRegistry`
- `DefaultRankingEngine` behaviour unchanged

### Acceptance criteria

- [x] Planned strategy classes exported
- [x] Structured `not_implemented` diagnostics — no throw
- [x] Registry lists active + planned strategies
- [x] DI registration extension points
- [x] DefaultRankingEngine / orchestrator behaviour unchanged
- [x] No semantic, AI, persistence, or provider changes
- [ ] Owner review before DF-015

### Dependencies

- DF-009

### Tests

- `planned-ranking-strategies.test.ts`
- `knowledge-discovery-context-ranking.test.ts`

### Estimated effort

**S**

Completion report: [DF-014-completion-report.md](../sprint/DF-014-completion-report.md)

---

## DF-015 — Knowledge Service + application integration ✅

### Objective

Introduce the public Knowledge Service API and perform the first application integration in `apps/web`.

### Scope

- `KnowledgeService` interface + `DefaultKnowledgeService`
- `createKnowledgeService()` + `useKnowledgeService()`
- Adapt internal `KnowledgeQueryClient` behind the service
- `loadKnowledgeSourceRegistryDto()` + `KnowledgeDiscoveryProvider` in authenticated shell
- Health endpoint `knowledge` field

### Acceptance criteria

- [x] Knowledge Service is the public client boundary
- [x] Experiences consume `useKnowledgeService()` (not orchestrator)
- [x] `apps/web` hydrates knowledge DTO + service
- [x] Health exposes framework, registry, service, query availability
- [x] Ranking, providers, registries, query behaviour unchanged
- [ ] Owner review before DF-016

### Dependencies

- DF-010, DF-011, DF-012, DF-013, DF-014

### Tests

- `knowledge-service.test.ts`
- `use-knowledge-service.test.tsx`
- `knowledge-hydration.test.ts`

### Estimated effort

**L**

Completion report: [DF-015-completion-report.md](../sprint/DF-015-completion-report.md)

---

## DF-016 — E2E tests ✅

### Objective

Playwright E2E coverage for Knowledge & Discovery Framework integration.

### Scope

- `testing/playwright/e2e/spr-005-knowledge-discovery-framework.spec.ts`
- Health endpoint `knowledge` field
- Authenticated shell Knowledge Service diagnostics
- Palette knowledge mode query + selection delegation (via `?paletteMode=knowledge`)

### Acceptance criteria

- [x] E2E suite passes in CI
- [x] No regression in existing E2E tests
- [x] Authenticated shell scenarios covered

### Dependencies

- DF-015

### Tests

- Playwright E2E (this story)

### Estimated effort

**M**

Completion report: [DF-016-completion-report.md](../sprint/DF-016-completion-report.md)

---

## DF-017 — Documentation ✅

### Objective

Document implemented Knowledge & Discovery Framework for Platform 2.0 extension.

### Scope

- `docs/architecture/knowledge-discovery-framework.md`
- Update Platform Reference Architecture (knowledge & discovery section)
- Developer onboarding guide
- Governance guides (Engineering Handbook, Capability, Runtime, Workbench)
- Architecture review + production readiness review
- `packages/knowledge-discovery-framework/README.md`
- Documentation index updates

### Acceptance criteria

- [x] Architecture doc complete
- [x] Onboarding covers adding a knowledge source, provider, service, experience
- [x] Registry Pattern and no-new-pipeline constraint documented
- [x] Terminology aligned to canonical layering
- [x] No production code in this story

### Dependencies

- DF-016

### Tests

- Quality gates green

### Estimated effort

**M**

Completion report: [DF-017-completion-report.md](../sprint/DF-017-completion-report.md)

---

## DF-018 — Sprint closeout ✅

### Objective

Close Sprint 005; Milestone 5 review; release preparation.

### Scope

- `docs/sprint/SPR-005-closeout.md`
- `docs/reviews/MILESTONE-005-knowledge-discovery-framework-review.md`
- `docs/releases/v0.5.0-knowledge-discovery-framework.md`
- Consolidated technical debt
- Do not create Git tag

### Acceptance criteria

- [x] All DF-001–DF-017 complete
- [x] Quality gates pass
- [x] Milestone verdict documented
- [ ] Owner approval gate for Milestone 6 planning

### Dependencies

- DF-017

### Tests

- Full quality gate suite including E2E

### Estimated effort

**M**

Closeout: [SPR-005-closeout.md](../sprint/SPR-005-closeout.md)

---

## Quality gates (all stories)

Every story PR must pass:

```bash
pnpm lint
pnpm typecheck
pnpm build
pnpm test
pnpm test:coverage
pnpm test:e2e    # when UI/integration affected
```

---

## Out of scope (SPR-005)

- Runtime orchestrator redesign
- Workbench engine changes
- Action Framework executor changes
- New execution pipeline
- Business capability indexes
- PostgreSQL search indexes
- Event Bus implementation
- Full semantic / AI search
- Production observability
- RBAC population (M8)

---

## Stop condition

**Do not begin DF-016** until:

1. DF-015 completion report reviewed and approved
2. Owner confirms DF-015 acceptance criteria

---

_SPR-005 Knowledge & Discovery Framework Engineering Backlog._
