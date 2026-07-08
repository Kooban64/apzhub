# SPR-005 — Architecture Review

> **Sprint:** SPR-005 — Knowledge & Discovery Framework  
> **Review date:** 2026-07-03  
> **Scope:** DF-001 through DF-016 (Knowledge & Discovery Framework delivery)  
> **Recommendation:** **Approve Milestone 5 documentation and production readiness review** — proceed to DF-018 sprint closeout when instructed

---

## Executive summary

SPR-005 delivers `@apzhub/knowledge-discovery-framework` as the APZHUB unified knowledge layer. The Knowledge Registry, provider adapters, orchestrator, ranking engine, client hydration, Knowledge Service, Presentation Layer, and two Knowledge Experiences (overlay, palette knowledge mode) integrate with existing Action and Workbench registries without introducing a parallel execution pipeline.

Application wiring in `apps/web` completes the path from Runtime bootstrap to Knowledge Service diagnostics and E2E-verified palette knowledge queries. Selection delegates through existing `execute()` and Workbench navigation.

**Overall architectural verdict:** **APPROVED WITH OBSERVATIONS**

Observations are documented limitations (in-process orchestrator, deferred UI surfaces, scaffold ranking strategies) scoped to future milestones — not architectural violations.

---

## Layering compliance

| Layer                        | Verdict | Notes                                           |
| ---------------------------- | ------- | ----------------------------------------------- |
| Knowledge Sources            | ✅      | Manifest + T0 catalogue; no runtime duplication |
| Knowledge Registry           | ✅      | Server-authoritative; client read-only DTO      |
| Knowledge Query API          | ✅      | Orchestrator internal to package                |
| Knowledge Service            | ✅      | Public client boundary (DF-015)                 |
| Knowledge Presentation Layer | ✅      | Workspace helpers; no execution                 |
| Knowledge Experiences        | ✅      | Consume service; delegate selection             |

Canonical stack enforced:

```text
Knowledge Sources → Registry → Query API → Presentation Layer → Experiences
```

Experiences do not import orchestrator or `KnowledgeQueryClient` in production paths.

---

## Dependency direction

| ADR / Rule                              | Compliance                                       |
| --------------------------------------- | ------------------------------------------------ |
| ADR-0027 Knowledge & Discovery package  | ✅ Dedicated package; clear exports              |
| ADR-0028 Knowledge Source model         | ✅ Tier taxonomy; registry integration           |
| ADR-0029 Execution routing              | ✅ No new pipeline; Action + Workbench paths     |
| Document 000 §6.1 API layering          | ✅ Runtime → Workbench/Action → KDF → Capability |
| Providers consume registries            | ✅ Projection only — no registry replacement     |
| No Experience → Orchestrator dependency | ✅ Enforced via Knowledge Service                |
| Baseline v1.0 frozen                    | ✅ No baseline document edits                    |

Dependency graph respects Platform 2.0: KDF sits between registries and Experience surfaces, consuming Action and Workbench DTOs as upstream inputs.

---

## Registry reuse

**Verdict:** ✅ Approved

```text
Action Registry DTO ──► ActionRegistryKnowledgeProvider ──► command documents
Workbench Registry DTO ► WorkbenchNavigationKnowledgeProvider ► navigation documents
Platform manifests ───► bootstrapKnowledgeRegistry() ────────► source registration
```

| Concern                             | Assessment                                        |
| ----------------------------------- | ------------------------------------------------- |
| No duplicate action definitions     | Providers reference `actionRef.actionId`          |
| No duplicate navigation definitions | Providers reference `navigation.target`           |
| Permission filtering                | Server-side DTO filter before client hydration    |
| Registry Pattern alignment          | Registration server-side; client read-only view   |
| Health reporting                    | `/api/health` `knowledge` field mirrors hydration |

**Observation:** Health hydration reloads command/workbench DTOs independently of layout parallel load — acceptable; optimise with shared cache in future (TD-DF15-01).

---

## Execution pipeline reuse

**Verdict:** ✅ Approved

Knowledge selection never bypasses established execution paths:

| Selection kind      | Path                                                            |
| ------------------- | --------------------------------------------------------------- |
| Command document    | `delegateKnowledgeOverlaySelection` → `execute(actionId)`       |
| Navigation document | `activateViewForRoute(target)` via Workbench navigation actions |

Command Palette **commands mode** remains on Action Registry search — intentionally separate from Knowledge Experience stack.

**Observation:** Service-type action handlers remain `NOT_IMPLEMENTED` at Action Framework level — unrelated to KDF but affects end-to-end action execution for service handlers.

---

## Separation of concerns

| Concern               | Owner                          | Assessment                     |
| --------------------- | ------------------------------ | ------------------------------ |
| Source registration   | Knowledge Registry (server)    | ✅ Clear                       |
| Query orchestration   | Orchestrator (internal)        | ✅ Not exposed to UI           |
| Public query boundary | Knowledge Service              | ✅ Stable API                  |
| Result presentation   | Presentation Layer (workspace) | ✅ Reusable across experiences |
| UI rendering          | Knowledge Experiences          | ✅ Thin composition            |
| Action execution      | Action Framework               | ✅ Unchanged                   |
| Navigation            | Workbench Framework            | ✅ Unchanged                   |
| Ranking               | Ranking Engine                 | ✅ Strategy plug-in model      |

Presentation Layer correctly avoids UI and execution — grouping, mapping, and delegation only.

---

## Future extensibility

| Extension point              | Status            | Recommendation                                                        |
| ---------------------------- | ----------------- | --------------------------------------------------------------------- |
| New Knowledge Provider       | Ready             | Register against source id; implement `query()`                       |
| Manifest `knowledge.sources` | Partial           | Extraction scaffolded; full provider wiring future                    |
| Ranking strategies           | Scaffold registry | Implement strategies without changing `DefaultRankingEngine` contract |
| New Knowledge Experience     | Ready             | Consume `useKnowledgeService()` + Presentation Layer                  |
| HTTP query adapter           | Not implemented   | Add behind `KnowledgeService` — do not expose orchestrator            |
| Semantic / AI search         | Deferred          | Use ranking scaffolds + future index tier                             |
| Global header search         | Deferred          | New Experience; reuse Presentation Layer                              |

Package `createKnowledgeDiscoveryContext()` composition root supports DI extension without architectural change.

---

## Subsystem observations

### Knowledge Service (DF-015)

- Correctly wraps internal query client
- `useKnowledgeService()` exposes lifecycle + `serviceDiagnostics`
- App factory `createKnowledgeServiceFromHydration()` wires orchestrator in-process

**Recommendation:** When edge deployment requires remote query, add HTTP-backed `KnowledgeQueryClient` inside service factory — preserve `useKnowledgeService()` contract.

### Knowledge Experiences (DF-012, DF-013)

- Overlay and palette knowledge mode share Presentation Layer
- Overlay not mounted in `DesktopShell` — wired via provider; activation deferred
- E2E uses `?paletteMode=knowledge` test hook — not a product feature

**Recommendation:** Enable overlay in shell when product requests header/search UX — no framework change required.

### Ranking (DF-009, DF-014)

- Default keyword + fuzzy strategies production-ready
- Planned strategies registered as scaffolds with diagnostics

**Recommendation:** Implement semantic/recency when index tier (M8+) available — register strategies without orchestrator changes.

---

## Testing assessment

| Area                                | Coverage         |
| ----------------------------------- | ---------------- |
| Registry, providers, orchestrator   | Unit             |
| Ranking engine + scaffolds          | Unit             |
| Knowledge Service, hooks, hydration | Unit + component |
| App wiring, diagnostics             | Integration      |
| Health + shell + palette knowledge  | E2E (spr-005)    |

**872 unit tests**, **24 E2E tests**, **91.55%** statement coverage at DF-017 review.

---

## Recommendations summary

| Priority | Recommendation                                                            |
| -------- | ------------------------------------------------------------------------- |
| P1       | Proceed to DF-018 sprint closeout and milestone review                    |
| P2       | Mount Knowledge Overlay when product enables global search UX             |
| P3       | Consolidate health/layout DTO hydration to reduce duplicate server loads  |
| P3       | Relocate provider register helpers from test-fixtures to provider modules |
| Future   | HTTP query client adapter for edge deployment                             |
| Future   | Semantic ranking when vector index available                              |

---

## Verdict

**APPROVED WITH OBSERVATIONS**

SPR-005 meets approved architectural scope. Layering, dependency direction, registry reuse, and execution pipeline reuse comply with ADRs 0027–0029. Deferred work is documented and does not require redesign.

---

_SPR-005 Architecture Review — Knowledge & Discovery Framework._
