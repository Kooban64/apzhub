# SPR-005 — Sprint Closeout Report

> **Sprint:** SPR-005 — Knowledge & Discovery Framework  
> **Milestone:** 5 — Knowledge & Discovery Framework  
> **Date:** 2026-07-03  
> **Status:** Complete — **awaiting owner approval before tag and Milestone 6 planning**

---

## Executive summary

SPR-005 delivered `@apzhub/knowledge-discovery-framework` — the APZHUB unified knowledge layer. Eighteen sequential stories (DF-001–DF-018) implemented Knowledge Sources, registry bootstrap, orchestrator query, ranking engine, client hydration, Knowledge Service, Knowledge Presentation Layer, two Knowledge Experiences, application integration, E2E verification, documentation, governance, and formal closeout.

The framework integrates with existing Action and Workbench registries without a parallel execution pipeline. Selection from Knowledge Experiences routes through Action `execute()` and Workbench navigation ([ADR-0029](../adr/ADR-0029-knowledge-discovery-execution-routing.md)).

**Recommended release tag:** `v0.5.0-knowledge-discovery-framework` (do **not** create until owner instructs).

---

## Story summary (DF-001 – DF-018)

| Story  | Title                                       | Status |
| ------ | ------------------------------------------- | ------ |
| DF-001 | Knowledge Source Architecture               | ✅     |
| DF-002 | Package scaffold                            | ✅     |
| DF-003 | KnowledgeRegistry core                      | ✅     |
| DF-004 | Manifest `knowledge.sources`                | ✅     |
| DF-005 | Server filter DTO                           | ✅     |
| DF-006 | KnowledgeDiscoveryOrchestrator              | ✅     |
| DF-007 | Action Registry knowledge provider          | ✅     |
| DF-008 | Workbench navigation knowledge provider     | ✅     |
| DF-009 | Ranking engine (keyword + fuzzy)            | ✅     |
| DF-010 | Client hydration + `useKnowledgeRegistry()` | ✅     |
| DF-011 | Client Knowledge Query API                  | ✅     |
| DF-012 | Knowledge Overlay (Knowledge Experience)    | ✅     |
| DF-013 | Command Palette knowledge mode              | ✅     |
| DF-014 | Ranking strategy scaffolds                  | ✅     |
| DF-015 | Knowledge Service + `apps/web` integration  | ✅     |
| DF-016 | E2E verification                            | ✅     |
| DF-017 | Documentation, governance, readiness review | ✅     |
| DF-018 | Sprint closeout (this document)             | ✅     |

**Package status:** `KNOWLEDGE_DISCOVERY_FRAMEWORK_STATUS = "service"`

---

## Deliverables

### Package (`@apzhub/knowledge-discovery-framework`)

| Area         | Deliverable                                                                     |
| ------------ | ------------------------------------------------------------------------------- |
| Registry     | Bootstrap, validation, metadata, DTO map/filter                                 |
| Providers    | Action Registry, Workbench navigation projections                               |
| Orchestrator | Multi-provider query, merge, dedupe, diagnostics                                |
| Ranking      | `DefaultRankingEngine`, keyword + fuzzy; strategy scaffolds                     |
| Client       | Hydration, internal query client, **Knowledge Service**                         |
| React        | `KnowledgeDiscoveryProvider`, `useKnowledgeRegistry()`, `useKnowledgeService()` |

### Workbench (`@apzhub/workspace`)

| Area               | Deliverable                                          |
| ------------------ | ---------------------------------------------------- |
| Presentation Layer | Grouping, mapping, selection delegation, diagnostics |
| Experiences        | Knowledge Overlay, Command Palette knowledge mode    |
| Shell              | `commandPaletteMode` prop; selection handler wiring  |

### Application (`apps/web`)

| Area        | Deliverable                                                |
| ----------- | ---------------------------------------------------------- |
| Hydration   | `knowledge-hydration.ts`, parallel layout load             |
| Service     | `useAppKnowledgeService()`, `ActionWorkbenchShellProvider` |
| Health      | `/api/health` `knowledge` field                            |
| Diagnostics | `KnowledgeDiscoveryDiagnostics` (dev/test only)            |

### ADRs

- ADR-0027 — Knowledge & Discovery Framework package
- ADR-0028 — Knowledge Source model and taxonomy
- ADR-0029 — Execution routing (no new pipeline)

---

## Architecture

### Canonical layering

```text
Knowledge Sources
        ↓
Knowledge Registry
        ↓
Knowledge Query API
        ↓
Knowledge Presentation Layer
        ↓
Knowledge Experiences
```

Public client boundary: **`useKnowledgeService()`** (DF-015).

Reference: [knowledge-discovery-framework.md](../architecture/knowledge-discovery-framework.md)

### Compliance

| Rule / ADR                                            | Result |
| ----------------------------------------------------- | ------ |
| ADR-0027 Package boundaries                           | ✅     |
| ADR-0028 Source taxonomy                              | ✅     |
| ADR-0029 No new execution pipeline                    | ✅     |
| Registry Pattern — server authority, client read-only | ✅     |
| No business modules                                   | ✅     |
| Baseline v1.0 frozen                                  | ✅     |

See [SPR-005 architecture review](../reviews/SPR-005-architecture-review.md).

---

## Engineering statistics

| Metric               | Value (DF-018 closeout)              |
| -------------------- | ------------------------------------ |
| Sprint stories       | 18 (DF-001–DF-018)                   |
| Unit/component tests | **872** (172 files)                  |
| E2E tests            | **24** (+5 spr-005)                  |
| Statement coverage   | **91.55%**                           |
| ADRs accepted        | 0027–0029                            |
| Spec documents       | 16 SPR-005 specs + architecture docs |
| Completion reports   | 18 (DF-001–DF-018)                   |

---

## Quality gates

All gates passed at DF-018 closeout (2026-07-03):

| Gate                 | Result                      |
| -------------------- | --------------------------- |
| `pnpm lint`          | ✅ Pass                     |
| `pnpm typecheck`     | ✅ Pass                     |
| `pnpm build`         | ✅ Pass                     |
| `pnpm test`          | ✅ Pass — 872 tests         |
| `pnpm test:coverage` | ✅ Pass — 91.55% statements |
| `pnpm test:e2e`      | ✅ Pass — 24 E2E tests      |

---

## Testing

| Layer                              | Coverage                                              |
| ---------------------------------- | ----------------------------------------------------- |
| Registry, bootstrap, DTO           | Unit                                                  |
| Providers, orchestrator            | Unit                                                  |
| Ranking engine + scaffolds         | Unit                                                  |
| Knowledge Service, hooks           | Unit + component                                      |
| Presentation Layer, experiences    | Component                                             |
| App wiring, health                 | Integration                                           |
| Shell + palette knowledge + health | E2E (`spr-005-knowledge-discovery-framework.spec.ts`) |

E2E scenarios: health `knowledge` field, `KnowledgeDiscoveryProvider` diagnostics, palette knowledge query, action delegation, navigation delegation.

---

## Documentation

| Document               | Path                                                                                                                              |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Subsystem architecture | [knowledge-discovery-framework.md](../architecture/knowledge-discovery-framework.md)                                              |
| Developer onboarding   | [knowledge-discovery-onboarding.md](../developer/knowledge-discovery-onboarding.md)                                               |
| Architecture review    | [SPR-005-architecture-review.md](../reviews/SPR-005-architecture-review.md)                                                       |
| Production readiness   | [MILESTONE-005-knowledge-discovery-production-readiness.md](../reviews/MILESTONE-005-knowledge-discovery-production-readiness.md) |
| Milestone review       | [MILESTONE-005-knowledge-discovery-framework-review.md](../reviews/MILESTONE-005-knowledge-discovery-framework-review.md)         |
| Release notes          | [v0.5.0-knowledge-discovery-framework.md](../releases/v0.5.0-knowledge-discovery-framework.md)                                    |
| Spec index             | [SPR-005-spec-index.md](../specs/SPR-005-spec-index.md)                                                                           |

---

## Governance

Updated in DF-017:

- [Engineering Handbook](../governance/APZHUB-Engineering-Handbook.md) — M5 in build order, testing, doc index
- [Capability Development Guide](../governance/APZHUB-Capability-Development-Guide.md) — `knowledge.sources`
- [Runtime Development Guide](../governance/APZHUB-Runtime-Development-Guide.md) — bootstrap, health
- [Workbench Development Guide](../governance/APZHUB-Workbench-Development-Guide.md) — Knowledge Experiences

---

## Developer experience

Engineers can:

- Declare Knowledge Sources in manifests
- Implement Knowledge Providers projecting registry DTOs
- Consume **`useKnowledgeService()`** in new Knowledge Experiences
- Reuse Presentation Layer helpers from `@apzhub/workspace`
- Verify integration via dev diagnostics and `/api/health` `knowledge`
- Run E2E with `?paletteMode=knowledge` test hook

Onboarding: [knowledge-discovery-onboarding.md](../developer/knowledge-discovery-onboarding.md)

---

## Consolidated technical debt

| ID         | Item                                                    | Target                                     |
| ---------- | ------------------------------------------------------- | ------------------------------------------ |
| TD-DF15-01 | Health hydration reloads command/workbench DTOs         | Optimise shared layout cache               |
| TD-DF15-02 | Provider register helpers in `test-fixtures.ts`         | Relocate to provider modules               |
| TD-DF15-03 | Knowledge Overlay not mounted in `DesktopShell`         | Product UX story                           |
| TD-DF15-04 | `useKnowledgeQuery()` deprecated but retained           | Remove when callers migrated               |
| TD-DF16-01 | `?paletteMode=knowledge` E2E hook                       | Replace with product toggle when available |
| TD-DF09-01 | Semantic/recency/personalisation ranking scaffolds only | M8+ index tier                             |
| TD-DF15-05 | In-process orchestrator only                            | HTTP adapter for edge deployment           |
| TD-AF-M4   | Service action handlers `NOT_IMPLEMENTED`               | Platform services milestone                |

---

## Deferred work

| Item                                    | Notes                               |
| --------------------------------------- | ----------------------------------- |
| Global header search Experience         | Overlay wired; shell mount deferred |
| Semantic / vector search                | Ranking scaffolds registered        |
| AI reranking / recommendations          | Future Experience tier              |
| HTTP Knowledge Query Client             | Edge deployment                     |
| Business capability knowledge providers | M9+                                 |
| Operational dashboards                  | Health endpoint sufficient for now  |

---

## Recommended release

**Tag:** `v0.5.0-knowledge-discovery-framework`  
**Baseline:** `v0.4.0-action-framework`

Do **not** create the Git tag until owner instructs.

---

## Recommendation for Milestone 6

**Planning only — do not implement.**

Per [Platform Roadmap](../architecture/platform-roadmap.md), Milestone 6 is the **Notification Framework** (Document 021). Recommended next steps for owners:

1. Approve Milestone 5 closeout and optional `v0.5.0-knowledge-discovery-framework` tag
2. Author Sprint 006 backlog from Document 021
3. Preserve KDF layering — notifications must not bypass Action/Workbench execution paths where user actions are involved
4. Defer semantic search and global header UX to dedicated product stories consuming existing Knowledge Service

---

## Stop condition

**Do not plan or implement Milestone 6** until owner approves this closeout.

---

_SPR-005 Sprint Closeout — Knowledge & Discovery Framework._
