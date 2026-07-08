# Milestone 5 — Knowledge & Discovery Framework Review

> **Milestone:** 5 — Knowledge & Discovery Framework  
> **Sprint:** SPR-005  
> **Review date:** 2026-07-03  
> **Release:** `v0.5.0-knowledge-discovery-framework` (recommended — tag pending owner instruction)  
> **Verdict:** **PASS WITH OBSERVATIONS — Milestone 5 Complete**

---

## Executive summary

### What was achieved

Milestone 5 delivered `@apzhub/knowledge-discovery-framework` and integrated it into the authenticated APZHUB shell. Over eighteen sequential stories (DF-001–DF-018), the team implemented the Knowledge Registry, provider adapters, orchestrator, ranking engine, client hydration, Knowledge Service public API, Knowledge Presentation Layer, Knowledge Overlay and Command Palette knowledge mode, application wiring, E2E verification, complete documentation, governance updates, and sprint closeout.

SPR-001 through SPR-004 remain intact. Knowledge queries flow through the Knowledge Service to the orchestrator; selections route through existing Action and Workbench paths — no parallel execution pipeline.

**872 unit tests** and **24 E2E tests** pass at closeout. **91.55%** statement coverage. ADRs 0027–0029 are accepted.

### Overall verdict

**PASS WITH OBSERVATIONS**

Milestone 5 meets its approved scope. Deferred items (global header search UI, semantic ranking, HTTP query adapter, overlay shell mount) are documented, accepted, and scheduled for future milestones — not blocking release of the Knowledge & Discovery platform layer.

---

## Architecture assessment

| Criterion                             | Rating                                                |
| ------------------------------------- | ----------------------------------------------------- |
| Layer separation                      | **Strong** — six-layer canonical model enforced       |
| Public API stability                  | **Strong** — Knowledge Service boundary (DF-015)      |
| Registry reuse                        | **Strong** — providers project Action/Workbench DTOs  |
| No parallel execution pipeline        | **Strong** — ADR-0029 compliant                       |
| Presentation vs Experience separation | **Strong** — Presentation Layer in workspace          |
| Extension points                      | **Good** — providers, ranking strategies, experiences |
| Baseline compliance                   | **Strong** — no v1.0 edits                            |

See [SPR-005 architecture review](./SPR-005-architecture-review.md) and [knowledge-discovery-framework.md](../architecture/knowledge-discovery-framework.md).

### Architecture summary

```text
Knowledge Sources → Knowledge Registry → Knowledge Query API
→ Knowledge Presentation Layer → Knowledge Experiences
                              ↓
                    Action execute() · Workbench navigation
```

---

## Engineering quality

| Criterion               | Rating                                                   |
| ----------------------- | -------------------------------------------------------- |
| Phased story delivery   | **Strong** — 18 stories, stop-after-review gates         |
| Package structure       | **Strong** — index, server, react exports                |
| DI patterns             | **Strong** — `createKnowledgeServiceFromHydration()`     |
| Immutability            | **Strong** — frozen documents, read-only client registry |
| Error handling          | **Good** — structured query lifecycle and diagnostics    |
| Technical debt tracking | **Good** — consolidated in sprint closeout               |

---

## Operational readiness

| Area                  | Status                                                |
| --------------------- | ----------------------------------------------------- |
| Health endpoint       | ✅ `knowledge` field on `/api/health`                 |
| Dev diagnostics       | ✅ `knowledge-discovery-diagnostics` (non-production) |
| In-process deployment | ✅ Acceptable for current Next.js Node runtime        |
| E2E verification      | ✅ spr-005 (5 scenarios)                              |
| Production dashboards | ⏳ Deferred — health sufficient for platform layer    |
| Remote query adapter  | ⏳ Deferred — edge deployment future work             |

See [MILESTONE-005 production readiness](./MILESTONE-005-knowledge-discovery-production-readiness.md).

---

## Quality metrics

| Metric                   | Closeout value      |
| ------------------------ | ------------------- |
| Unit/component tests     | **872** (172 files) |
| E2E tests                | **24**              |
| Statement coverage       | **91.55%**          |
| Branch coverage          | 87.43%              |
| Lint / typecheck / build | ✅ All pass         |

---

## Known limitations

1. **In-process orchestrator** — query runs in Node during hydration; no HTTP query endpoint
2. **Overlay not shell-mounted** — Knowledge Overlay Experience wired via provider; global search UI deferred
3. **Keyword + fuzzy ranking only** — semantic/recency/personalisation scaffolds registered, not active
4. **Palette knowledge mode** — E2E via `?paletteMode=knowledge` test hook; not default product mode
5. **Deprecated `useKnowledgeQuery()`** — retained for backward compatibility
6. **Service action handlers** — inherited M4 limitation; some actions return `NOT_IMPLEMENTED`
7. **RBAC population** — permission keys declared; full session enforcement Milestone 8

---

## Deferred capabilities

| Capability                           | Target                           |
| ------------------------------------ | -------------------------------- |
| Global header search Experience      | Product UX story                 |
| Semantic / vector search             | M8+ search index tier            |
| AI reranking / recommendations       | M9+ / assistant integration      |
| HTTP Knowledge Query Client          | Edge / micro-frontend deployment |
| Manifest tier-2+ knowledge providers | M9+ business capabilities        |
| Knowledge overlay in DesktopShell    | Product activation               |
| Operational analytics dashboards     | Post-GA observability            |

---

## Documentation assessment

| Artifact                         | Status      |
| -------------------------------- | ----------- |
| Subsystem architecture           | ✅ Complete |
| 16 SPR-005 specifications        | ✅ Complete |
| 18 completion reports            | ✅ Complete |
| Developer onboarding             | ✅ Complete |
| Governance guides (4)            | ✅ Updated  |
| Architecture + readiness reviews | ✅ Complete |
| Release notes v0.5.0             | ✅ Prepared |
| Sprint closeout                  | ✅ Complete |

---

## Remaining work before commercial GA

Milestone 5 delivers the **platform knowledge layer** — not commercial GA of a full unified search product.

Before commercial GA, owners should plan:

| Area              | Work                                         |
| ----------------- | -------------------------------------------- |
| Product UX        | Global search / header Experience activation |
| Search quality    | Semantic index and advanced ranking          |
| Identity          | Full RBAC permission population (M8)         |
| Platform services | Service handler implementation for actions   |
| Operations        | Production monitoring beyond health endpoint |
| Business content  | Capability knowledge providers (M9+)         |

These items do not require architectural redesign of Milestone 5 deliverables.

---

## Recommendation for release

**Recommend:** Owner approve Milestone 5 complete and optionally tag **`v0.5.0-knowledge-discovery-framework`** when ready.

**Do not** create the Git tag as part of this review.

**Do not** begin Milestone 6 implementation until owner approves closeout and Sprint 006 backlog.

---

## Recommendation for Milestone 6 (planning only)

Per [Platform Roadmap](../architecture/platform-roadmap.md), **Milestone 6 — Notification Framework** (Document 021) is the next platform layer.

Suggested planning focus:

1. Notification delivery and attention management — independent of KDF query path
2. Preserve Action Framework for user-initiated responses to notifications
3. Optional future integration: Knowledge Experiences surfacing notification-related documents
4. No Sprint 006 code until backlog approved

---

_Milestone 5 Review — Knowledge & Discovery Framework._
