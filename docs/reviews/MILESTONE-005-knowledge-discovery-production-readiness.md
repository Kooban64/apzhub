# Milestone 5 — Knowledge & Discovery Framework Production Readiness Review

> **Milestone:** 5 — Knowledge & Discovery Framework  
> **Sprint:** SPR-005  
> **Review date:** 2026-07-03  
> **Release:** `v0.5.0-knowledge-discovery-framework` (proposed — DF-018)  
> **Verdict:** **PASS WITH OBSERVATIONS — Milestone 5 Ready for Closeout**

---

## Executive summary

Milestone 5 delivered `@apzhub/knowledge-discovery-framework` and integrated it into the authenticated APZHUB shell. Eighteen sequential stories (DF-001–DF-017) implemented the Knowledge Registry, provider adapters, orchestrator, ranking engine, client hydration, Knowledge Service, Presentation Layer, two Knowledge Experiences, E2E verification, and complete documentation.

SPR-001 Desktop Shell, SPR-002 Platform Runtime, SPR-003 Workbench Framework, and SPR-004 Action Framework remain intact. Knowledge queries flow through the Knowledge Service to the orchestrator; selections route through existing Action and Workbench execution paths.

**872 unit tests** and **24 E2E tests** pass at DF-017 review. **91.55%** statement coverage. ADRs 0027–0029 are accepted.

**Overall verdict:** **PASS WITH OBSERVATIONS**

Deferred items (semantic search, global header UI, HTTP query adapter, overlay shell mount) are documented and scheduled for future milestones — not blocking release of the Knowledge & Discovery platform layer.

---

## Assessment dimensions

### Architecture — Strong

| Criterion                      | Rating                                            |
| ------------------------------ | ------------------------------------------------- |
| Layer separation               | Strong — six-layer model enforced                 |
| Public API stability           | Strong — Knowledge Service boundary               |
| Registry reuse                 | Strong — projection providers only                |
| No parallel execution pipeline | Strong — ADR-0029 compliant                       |
| Extension points               | Good — providers, ranking strategies, experiences |
| Baseline compliance            | Strong — no v1.0 edits                            |

See [SPR-005 architecture review](./SPR-005-architecture-review.md).

---

### Engineering — Strong

| Criterion               | Rating                                               |
| ----------------------- | ---------------------------------------------------- |
| Phased story delivery   | Strong — 17 stories, stop-after-review gates         |
| Package structure       | Strong — index, server, react exports                |
| DI patterns             | Strong — `createKnowledgeServiceFromHydration()`     |
| Immutability            | Strong — frozen documents, read-only client registry |
| Technical debt tracking | Good — consolidated below                            |

---

### Documentation — Complete (DF-017)

| Artifact                                          | Status   |
| ------------------------------------------------- | -------- |
| Architecture (`knowledge-discovery-framework.md`) | Complete |
| Governance guides (4 updated)                     | Complete |
| Developer onboarding                              | Complete |
| Architecture review                               | Complete |
| Production readiness (this document)              | Complete |
| Spec index + 17 completion reports                | Complete |
| Package README                                    | Updated  |

---

### Testing — Strong

| Area                             | Coverage         |
| -------------------------------- | ---------------- |
| Registry, bootstrap, DTO         | Unit             |
| Providers, orchestrator          | Unit             |
| Ranking engine + scaffolds       | Unit             |
| Knowledge Service, hooks         | Unit + component |
| App hydration, diagnostics       | Integration      |
| Health, shell, palette knowledge | E2E              |

---

## Known limitations

| Limitation                          | Impact                                          | Mitigation                                               |
| ----------------------------------- | ----------------------------------------------- | -------------------------------------------------------- |
| In-process orchestrator only        | Query runs in Node during SSR/hydration path    | Acceptable for current deployment; HTTP adapter future   |
| Overlay not mounted in DesktopShell | No global search/modal UX in production shell   | Provider wired; enable when product requests             |
| Keyword + fuzzy ranking only        | No semantic/recency/personalisation ranking yet | Scaffold strategies registered; default engine unchanged |
| Manifest knowledge providers        | Extraction scaffolded; not all tiers active     | T0 platform providers production-ready                   |
| `useKnowledgeQuery()` retained      | Deprecated API still exported                   | Migrate experiences to `useKnowledgeService()`           |
| E2E palette mode via query param    | Test hook only                                  | Not exposed as product feature                           |

---

## Technical debt

| ID         | Item                                                        | Notes                                                      |
| ---------- | ----------------------------------------------------------- | ---------------------------------------------------------- |
| TD-DF15-01 | `hydrateKnowledgeRegistry()` reloads command/workbench DTOs | Duplicate work vs layout parallel load                     |
| TD-DF15-02 | Provider register helpers in `test-fixtures.ts`             | Used in production hydration; relocate to provider modules |
| TD-DF15-03 | Overlay/header not mounted in `DesktopShell`                | Experiences wired; UI activation deferred                  |
| TD-DF15-04 | `useKnowledgeQuery()` deprecated but retained               | Backward compatibility for tests                           |
| TD-DF16-01 | `?paletteMode=knowledge` E2E hook                           | Document as test-only; remove when product toggle exists   |
| TD-DF02-07 | Legacy `@apzhub/search` references in older docs            | Resolved in DF-017 documentation pass                      |

---

## Deferred work

| Item                                  | Target milestone  | Notes                                           |
| ------------------------------------- | ----------------- | ----------------------------------------------- |
| Global header search Experience       | M5+ product story | Reuse Presentation Layer                        |
| Semantic / vector search              | M8+ index tier    | Ranking scaffold ready                          |
| AI reranking / recommendations        | M9+               | No architectural change required                |
| HTTP Knowledge Query Client           | Edge deployment   | Behind Knowledge Service                        |
| Operational dashboards                | Out of scope      | Health endpoint sufficient for now              |
| Business capability knowledge sources | M9+               | Manifest `knowledge.sources` pattern documented |

---

## Operational considerations

### Health endpoint

`GET /api/health` includes optional `knowledge` field:

| Field                               | Meaning                                    |
| ----------------------------------- | ------------------------------------------ |
| `frameworkStatus`                   | Package status (`"service"`)               |
| `serviceStatus`                     | `ready` \| `unavailable`                   |
| `queryAvailable`                    | Registry ready + orchestrator client ready |
| `registeredCount` / `filteredCount` | Server hydration counts                    |

Unauthenticated health uses allow-all permission adapter for visibility counts.

### Dev/test diagnostics

| Test id                           | Environment    | Purpose                         |
| --------------------------------- | -------------- | ------------------------------- |
| `knowledge-discovery-diagnostics` | non-production | Knowledge Service state for E2E |
| `action-framework-diagnostics`    | non-production | Action hydration (existing)     |

Hidden `<aside>` elements — not user-visible.

### Deployment

- `@apzhub/knowledge-discovery-framework` in `transpilePackages` (`apps/web/next.config.ts`)
- No separate KDF service — runs in-process with Next.js Node runtime
- Redis/database health independent of knowledge hydration

---

## Future milestones

| Milestone                | KDF relevance                                             |
| ------------------------ | --------------------------------------------------------- |
| M6 Notification          | No direct KDF dependency                                  |
| M8 Search index          | Semantic ranking strategies; vector providers             |
| M9 Business capabilities | Manifest knowledge sources; capability providers          |
| M10+ AI Assistant        | Knowledge Experiences consume ranked documents as context |

**Constraint preserved:** No new execution pipeline for knowledge selection.

---

## Release readiness checklist

| Gate                               | Status                   |
| ---------------------------------- | ------------------------ |
| Quality gates green                | ✅                       |
| Architecture review approved       | ✅                       |
| Documentation complete             | ✅                       |
| E2E coverage                       | ✅ spr-005 (5 scenarios) |
| ADRs accepted                      | ✅ 0027–0029             |
| No architectural redesign proposed | ✅                       |
| Owner review for closeout          | ⏳ DF-018                |

---

## Recommendation

**Proceed to DF-018** — Sprint 005 closeout, milestone review, and proposed `v0.5.0-knowledge-discovery-framework` release notes.

Do **not** begin Sprint 006 capability work until owner approves Milestone 5 closeout.

---

_Milestone 5 Production Readiness Review — Knowledge & Discovery Framework._
