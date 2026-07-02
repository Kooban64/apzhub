# SPR-005 — Knowledge & Discovery Framework Engineering Backlog

> **Sprint:** SPR-005 — Knowledge & Discovery Framework  
> **Milestone:** 5 — Knowledge & Discovery Framework  
> **Mode:** DF-001 complete — **await review before DF-002**  
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
DF-010 Client hydration + useKnowledgeDiscovery
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

## DF-002 — Package scaffold

### Objective

Create Knowledge & Discovery Framework package scaffold with exports, status constant, and CI integration.

### Scope

- Package: `@apzhub/knowledge-discovery-framework` ([ADR-0027](../adr/ADR-0027-knowledge-discovery-framework-package.md))
- `src/index.ts`, `src/server.ts`, `src/react/index.ts`
- `package.json`, `tsconfig.json`
- Vitest config inclusion
- Root `transpilePackages` entry in `apps/web/next.config.ts` (when app integration story lands)

### Acceptance criteria

- [ ] Package builds and typechecks
- [ ] Empty exports compile
- [ ] Workspace dependency from `apps/web` possible
- [ ] No implementation beyond scaffold

### Dependencies

- DF-001

### Tests

- Package import smoke test

### Estimated effort

**S**

---

## DF-003 — KnowledgeSourceRegistry core

### Objective

Implement in-memory KnowledgeSourceRegistry following Registry Pattern.

### Scope

- `KnowledgeSourceRegistry` — register, get, list, diagnostics
- Provider descriptor types (id, label, kind, permission, priority)
- Duplicate detection diagnostics
- Deep-freeze descriptors

### Acceptance criteria

- [ ] Register/list/get providers
- [ ] Diagnostics report counts and duplicates
- [ ] Registry Pattern principles followed (registration not execution)
- [ ] Unit tests ≥ 85% on registry module

### Dependencies

- DF-002

### Tests

- `knowledge-source-registry.test.ts` — register, duplicate, list, diagnostics

### Estimated effort

**M**

---

## DF-004 — Provider registration from manifests

### Objective

Extend Manifest Engine (via ADR) to declare `knowledge.sources`; extract at bootstrap.

### Scope

- Zod schema for `knowledge.sources` manifest block
- Extraction helper: capability records → provider descriptors
- Integration with `Runtime.bootstrap()` chain
- Fixture manifests for tests

### Acceptance criteria

- [ ] Valid manifests extract providers
- [ ] Invalid manifests fail validation with actionable errors
- [ ] Extraction unit tests with fixtures
- [ ] No changes to Runtime orchestrator pipeline without ADR

### Dependencies

- DF-003, DF-001 ADR

### Tests

- Manifest validation tests
- Extraction unit tests

### Estimated effort

**L**

---

## DF-005 — Server filter DTO

### Objective

Permission-filter knowledge source DTO server-side before client hydration.

### Scope

- `KnowledgeSourceRegistryDto` serialisable type
- `filterKnowledgeSourceRegistryDto(dto, permissionAdapter)`
- `buildKnowledgeDiscoveryHydrationDiagnostics()`
- Mirror Action Framework filter pattern (AF-005)

### Acceptance criteria

- [ ] Filtered DTO strips disallowed providers
- [ ] Diagnostics report registered vs filtered counts
- [ ] Unit tests for filter edge cases
- [ ] Exported from `@apzhub/knowledge-discovery-framework/server`

### Dependencies

- DF-003

### Tests

- `filter-knowledge-source-registry-dto.test.ts`

### Estimated effort

**M**

---

## DF-006 — KnowledgeDiscoveryOrchestrator (keyword + fuzzy)

### Objective

Implement query orchestration across registered knowledge sources with keyword and fuzzy matching.

### Scope

- `KnowledgeDiscoveryOrchestrator.query({ text, context, permissions })`
- Provider dispatch in priority order
- Result merging and deduplication by entity id
- Fuzzy scoring scaffold (reuse patterns from Action Registry search where appropriate)

### Acceptance criteria

- [ ] Keyword search returns ranked results
- [ ] Fuzzy matching works on label and keywords
- [ ] Empty query handled gracefully
- [ ] Diagnostics on query duration and provider counts
- [ ] No execution — returns knowledge entities with action/navigation references only

### Dependencies

- DF-003

### Tests

- Orchestrator unit tests with mock providers
- Fuzzy ranking tests

### Estimated effort

**L**

---

## DF-007 — Action Registry knowledge source

### Objective

Implement built-in T0 source that projects Action Registry entries as knowledge entities.

### Scope

- `ActionRegistryKnowledgeSource` — reads from ActionRegistry snapshot
- Maps actions to knowledge entities (entityId, title, group, shortcut, actionRef)
- Permission-aware via registry filter (already applied server-side)
- Consumes `@apzhub/command-framework` — no duplicate action storage

### Acceptance criteria

- [ ] Platform and manifest actions appear in knowledge results
- [ ] Selecting result references `actionRef` for existing `execute()` path
- [ ] No duplicate Action Registry
- [ ] Integration test with `bootstrapActionRegistry`

### Dependencies

- DF-006, Platform 2.0 Action Framework

### Tests

- Provider unit tests
- Integration test with command-framework bootstrap

### Estimated effort

**M**

---

## DF-008 — Workbench navigation knowledge source

### Objective

Implement T0 source projecting Workbench navigation items as knowledge entities.

### Scope

- `WorkbenchNavigationKnowledgeSource`
- Consumes Workbench registry DTO (navigation contributions)
- Results route to Workbench navigation requests (not new path)

### Acceptance criteria

- [ ] Activity bar workspaces discoverable by label
- [ ] Sidebar items discoverable within active workspace context
- [ ] Selection triggers existing Workbench navigation API
- [ ] Integration test with workbench registry hydration

### Dependencies

- DF-006, Platform 2.0 Workbench Framework

### Tests

- Provider unit tests
- Integration with workbench registry DTO fixtures

### Estimated effort

**M**

---

## DF-009 — Ranking scaffold (recency + frequency)

### Objective

Scaffold ranking hooks for recently used and frequently used entities.

### Scope

- `KnowledgeRankingContext` interface
- In-memory recency/frequency store (client session scope)
- `recordKnowledgeSelection(entityId)` hook
- Ranking boost applied in orchestrator merge
- Extension points for Document 023 preferences (stub)

### Acceptance criteria

- [ ] Recent selections boost ranking
- [ ] Frequency counter increments on selection
- [ ] Diagnostics expose store sizes
- [ ] No PostgreSQL persistence (deferred M8)

### Dependencies

- DF-006

### Tests

- Ranking unit tests
- Recency boost verification

### Estimated effort

**M**

---

## DF-010 — Client hydration + useKnowledgeDiscovery

### Objective

Hydrate read-only client knowledge discovery context from server DTO; React hooks.

### Scope

- `createKnowledgeDiscoveryFromDto(dto)`
- `KnowledgeDiscoveryProvider` React context
- `useKnowledgeDiscovery()` — query, results, isReady, diagnostics
- `useKnowledgeDiscoveryQuery()` debounced hook

### Acceptance criteria

- [ ] Server DTO hydrates client read-only view
- [ ] Provider exposes orchestrator query method
- [ ] React hook tests with test provider
- [ ] One-way hydration documented (no client registration)

### Dependencies

- DF-005, DF-006

### Tests

- `create-knowledge-discovery-from-dto.test.ts`
- `use-knowledge-discovery.test.tsx`

### Estimated effort

**M**

---

## DF-011 — Header search UI

### Objective

Implement header search input in Desktop Shell triggering knowledge discovery query.

### Scope

- Search input component in `@apzhub/ui` or `@apzhub/workspace`
- Wire to `useKnowledgeDiscovery().query()`
- Keyboard activation (Document 020 default chord — ADR)
- Accessible label and focus management

### Acceptance criteria

- [ ] Search input visible in authenticated shell header
- [ ] Typing triggers debounced knowledge discovery query
- [ ] WCAG AA keyboard accessible
- [ ] Component tests pass

### Dependencies

- DF-010

### Tests

- Component tests (RTL)
- a11y axe check

### Estimated effort

**M**

---

## DF-012 — Knowledge discovery overlay

### Objective

Implement knowledge discovery results overlay (grouped results presentation).

### Scope

- `KnowledgeDiscoveryOverlay` component in `@apzhub/workspace`
- Grouped results by provider kind (Actions, Navigation, future)
- Selection handler routes to Action `execute()` or Workbench navigation
- Empty state and loading state

### Acceptance criteria

- [ ] Overlay renders grouped results
- [ ] Action selection calls existing `useCommandRegistry().execute()`
- [ ] Navigation selection calls Workbench API
- [ ] No new execution pipeline introduced
- [ ] Component + integration tests

### Dependencies

- DF-010, DF-011

### Tests

- Component tests
- Integration test with mock providers

### Estimated effort

**L**

---

## DF-013 — Palette integration

### Objective

Integrate knowledge results with Command Palette — commands as knowledge entities without duplication.

### Scope

- Palette may consume KnowledgeDiscoveryOrchestrator for unified search within palette
- OR knowledge overlay coexists with palette (ADR decision in DF-001 — [ADR-0029](../adr/ADR-0029-knowledge-discovery-execution-routing.md))
- Ensure no duplicate action lists maintained in UI
- Document interaction model in spec

### Acceptance criteria

- [ ] Single source of truth for action discoverability
- [ ] Palette Ctrl+Shift+P behaviour preserved
- [ ] Knowledge overlay and palette documented interaction
- [ ] E2E: search finds platform action and executes via existing pipeline

### Dependencies

- DF-007, DF-012, Platform 2.0 Command Palette

### Tests

- Integration tests
- E2E scenario in DF-016

### Estimated effort

**M**

---

## DF-014 — Semantic / AI discovery stubs

### Objective

Export extension interfaces for semantic and AI-assisted knowledge sources; stub implementations.

### Scope

- `SemanticKnowledgeSource` interface — `search(query, context)` stub returns NOT_IMPLEMENTED
- `AiKnowledgeSource` interface — stub returns NOT_IMPLEMENTED
- Registration in KnowledgeSourceRegistry with `status: planned`
- Document 020 alignment notes

### Acceptance criteria

- [ ] Interfaces exported and documented
- [ ] Stubs return structured failure — no throw
- [ ] Orchestrator skips or reports planned providers in diagnostics
- [ ] No AI service integration

### Dependencies

- DF-003, DF-006

### Tests

- Stub unit tests

### Estimated effort

**S**

---

## DF-015 — Application integration

### Objective

Wire Knowledge & Discovery Framework into `apps/web` authenticated shell.

### Scope

- `loadKnowledgeSourceRegistryDto()` server hydration (parallel to command/workbench)
- `KnowledgeDiscoveryShellProvider` or extend `ActionWorkbenchShellProvider`
- Enable header search + overlay in `DesktopShell`
- Health endpoint optional `knowledge` field (non-breaking)
- `next.config.ts` transpilePackages

### Acceptance criteria

- [ ] Authenticated users receive hydrated knowledge discovery context
- [ ] Header search and overlay functional end-to-end
- [ ] Action execution routes through existing Action Framework pipeline
- [ ] Navigation routes through Workbench API
- [ ] Integration tests for app wiring

### Dependencies

- DF-010, DF-011, DF-012

### Tests

- App integration tests
- Health endpoint test if field added

### Estimated effort

**L**

---

## DF-016 — E2E tests

### Objective

Playwright E2E coverage for Knowledge & Discovery Framework integration.

### Scope

- `testing/playwright/e2e/spr-005-knowledge-discovery-framework.spec.ts`
- Scenarios: header search, result selection, action execution via knowledge discovery, navigation discovery
- Health endpoint knowledge field (if implemented)

### Acceptance criteria

- [ ] E2E suite passes in CI
- [ ] No regression in existing 19 E2E tests
- [ ] Authenticated shell scenarios covered

### Dependencies

- DF-015

### Tests

- Playwright E2E (this story)

### Estimated effort

**M**

---

## DF-017 — Documentation

### Objective

Document implemented Knowledge & Discovery Framework for Platform 2.0 extension.

### Scope

- `docs/architecture/knowledge-discovery-framework.md`
- Update Platform Reference Architecture (knowledge & discovery section — post-implementation)
- Developer onboarding addendum
- `packages/knowledge-discovery-framework/README.md`
- CHANGELOG entry

### Acceptance criteria

- [ ] Architecture doc complete
- [ ] Onboarding covers adding a knowledge source
- [ ] Registry Pattern and no-new-pipeline constraint documented
- [ ] No production code in this story

### Dependencies

- DF-015

### Tests

- Quality gates green

### Estimated effort

**M**

---

## DF-018 — Sprint closeout

### Objective

Close Sprint 005; Milestone 5 review; release preparation.

### Scope

- `docs/sprint/SPR-005-closeout.md`
- `docs/reviews/SPR-005-architecture-review.md`
- `docs/reviews/MILESTONE-005-knowledge-discovery-framework-review.md`
- `docs/releases/v0.5.0-knowledge-discovery-framework.md` (proposed)
- Consolidated technical debt
- Do not create Git tag

### Acceptance criteria

- [ ] All DF-001–DF-017 complete
- [ ] Quality gates pass
- [ ] Milestone verdict documented
- [ ] Owner approval gate for Sprint 006

### Dependencies

- DF-001 through DF-017

### Tests

- Full quality gate suite including E2E

### Estimated effort

**M**

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

**Do not begin DF-002** until:

1. DF-001 completion report reviewed and approved
2. Owner confirms ADRs 0027–0029

---

_SPR-005 Knowledge & Discovery Framework Engineering Backlog._
