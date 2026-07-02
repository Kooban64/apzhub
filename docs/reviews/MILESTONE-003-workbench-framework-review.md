# Milestone 3 — Workbench Framework Review

> **Milestone:** 3 — Workbench Framework  
> **Sprint:** SPR-003  
> **Review date:** 2026-06-28  
> **Release:** `v0.3.0-workbench-framework` (recommended)  
> **Verdict:** **PASS WITH OBSERVATIONS — Milestone 3 Complete**

---

## Executive summary

### What was achieved

Milestone 3 delivered `@apzhub/workbench-framework` — the permanent APZHUB user interaction layer. Over eight phased sprints, the team implemented the Workbench Manager, Request Bus, eight specialised engines, Workbench API v1.0, registry-driven shell navigation, client session persistence, context/selection scaffolds, and permission integration with server-side registry filtering.

SPR-001 Desktop Shell and SPR-002 Platform Runtime remain intact. The workbench layer consumes `Runtime.registry()` output through filtered DTOs and orchestrates UI state without exposing engine internals to capabilities.

**383 unit tests** and **15 E2E tests** pass at closeout. ADRs 0019–0023 are accepted. Document 000 now codifies the three-layer API model (Runtime / Workbench / Capability).

### Overall verdict

**PASS WITH OBSERVATIONS**

Milestone 3 meets its approved scope. Deferred items (tab bar, view mount pipeline, full RBAC population, Command Framework) are documented, accepted, and scheduled for Milestones 4 and 8 — not blocking release of the workbench infrastructure foundation.

---

## Architecture maturity

| Dimension            | Assessment                                                            |
| -------------------- | --------------------------------------------------------------------- |
| Layer separation     | **Strong** — Runtime UI-agnostic; Workbench owns React orchestration  |
| Request transport    | **Strong** — ADR-0020 enforced; no capability→engine bypass           |
| API surface          | **Appropriate** — Workbench API v1.0; server filter for hydration     |
| Engine decomposition | **Strong** — eight engines with clear responsibilities                |
| Permission model     | **Good** — adapter DI and restore sanitisation; RBAC data deferred    |
| Session model        | **Good** — versioned schema, local persistence; server sync deferred  |
| Extension points     | **Good** — Workbench Actions, Command Bridge interface, §6.1 layering |

### Subsystem interaction model

```text
Capability API (manifests, future SDKs)
        │ Workbench Requests
        ▼
Workbench API ──► Request Bus ──► Workbench Manager
                                        │
              ┌─────────────────────────┼─────────────────────────┐
              ▼                         ▼                         ▼
        Navigation Engine        View Engine              Session Engine
        Layout Engine            Panel Engine             Context Engine
                                                        Selection Engine
              │                         │                         │
              └─────────────────────────┴─────────────────────────┘
                                        ▼
                              React Desktop Shell (apps/web)
                                        ▲
                              Runtime API (bootstrap, registry)
```

---

## Engineering maturity

| Dimension        | Assessment                                                    |
| ---------------- | ------------------------------------------------------------- |
| Phased delivery  | **Strong** — ADR-0017 gates; phase reports 0–7                |
| Test coverage    | **Strong** — 383 unit; branch ≥ 80% on workbench-framework    |
| Documentation    | **Strong** — architecture docs, ADRs, phase reports, closeout |
| CI quality gates | **Passing** — lint, typecheck, build, test, coverage, E2E     |
| App integration  | **Good** — hydration, providers, route sync                   |
| Technical debt   | **Documented** — consolidated in closeout report              |

---

## Test maturity

| Area                                                                | Coverage           |
| ------------------------------------------------------------------- | ------------------ |
| Workbench Manager routing                                           | Unit + integration |
| Request Bus publish/handle                                          | Unit               |
| Each engine (layout, panel, nav, view, session, context, selection) | Unit               |
| Workbench API helpers                                               | Unit               |
| Permission adapter + server filter                                  | Unit               |
| Session restore + sanitisation                                      | Unit + E2E         |
| Shell navigation and routing                                        | E2E                |

Gaps are intentional scaffolds: context panel UI, selection UI, command bridge, tab bar — no tests required until features land.

---

## Technical debt

| Priority | Item                                    | Target              |
| -------- | --------------------------------------- | ------------------- |
| Medium   | Tab bar UI; multi-view presentation     | Post-M3 UX          |
| Medium   | Capability view mount pipeline          | M9 / capability SDK |
| Medium   | RBAC permissions from auth session      | M8                  |
| Medium   | `WorkbenchCommandBridge` implementation | Sprint 004          |
| Low      | Deep link SSR route guard               | Hardening           |
| Low      | Context panel / selection shell wiring  | UX polish           |
| Low      | `getManager()` bus escape hatch         | Hardening           |
| Low      | Legacy engine exports on package index  | Cleanup             |
| Low      | Icon asset system for Activity Bar      | Design system       |

Full register: [SPR-003-closeout.md](../sprint/SPR-003-closeout.md).

---

## Risks

| Risk                                                   | Severity        | Mitigation                                                            |
| ------------------------------------------------------ | --------------- | --------------------------------------------------------------------- |
| Empty RBAC in auth adapter allows all registry entries | Medium until M8 | Server filter + restore sanitisation in place; document M8 dependency |
| Single-view UX limits power users                      | Low             | Tab bar tracked in session schema; UI deferred                        |
| Client-only session — no cross-device sync             | Low             | ADR-0021 scope; PostgreSQL sync planned M8                            |
| Capabilities may attempt engine bypass                 | Low             | Document 000 §6.1; lint/review enforcement                            |
| Sprint 004 scope creep into M3 debt                    | Medium          | Closeout defines extension points only; stop condition enforced       |

---

## Recommendations

1. **Release** `v0.3.0-workbench-framework` after owner approval — infrastructure is release-ready.
2. **Sprint 004 planning** — implement Command Framework using documented extension points (Workbench Actions, Command Bridge, palette/keyboard hooks).
3. **Milestone 8 coordination** — wire RBAC permission keys into `AuthWorkbenchPermissionAdapter` when Identity milestone lands.
4. **Hardening backlog** — restrict `getManager()` visibility; add deep-link route guard before business capabilities (M9).
5. **Do not expand M3 scope** — tab bar and view mount pipeline are UX/capability concerns, not blockers for Command Framework.

---

## Comparison to Milestone 2

| Aspect                    | M2 Platform Runtime | M3 Workbench Framework |
| ------------------------- | ------------------- | ---------------------- |
| React dependency          | None                | Required               |
| Primary consumer          | Server bootstrap    | Shell + capabilities   |
| Test count (unit)         | 260                 | 383                    |
| E2E                       | Runtime health      | Full shell navigation  |
| Deferred persistence      | Registry PostgreSQL | Session PostgreSQL     |
| Next milestone dependency | M3 Workbench        | M4 Command Framework   |

---

## Sign-off criteria

| Criterion                     | Met |
| ----------------------------- | --- |
| All Phase 0–7 exit criteria   | ✅  |
| Quality gates pass            | ✅  |
| Architecture review filed     | ✅  |
| Release notes prepared        | ✅  |
| No Sprint 004 code            | ✅  |
| Owner tag instruction pending | ⏳  |

---

**Verdict: PASS WITH OBSERVATIONS — Milestone 3 Complete. Await owner approval for release tag and Sprint 004 gate.**

---

_Milestone 3 — Workbench Framework review._
