# SPR-005 — Knowledge & Discovery Framework

> **Sprint:** SPR-005  
> **Milestone:** 5 — Knowledge & Discovery Framework  
> **Status:** **Closed** — Milestone 5 complete; await owner approval before Milestone 6  
> **Authority:** [Document 020](../020-unified-search-knowledge-discovery-framework.md) · [Platform Roadmap v2](../roadmap/APZHUB-Platform-Roadmap-v2.md) · [SPR-005 backlog](../backlog/SPR-005-knowledge-discovery-framework-backlog.md)

---

## Initiative rename

At Sprint 005 commencement, the initiative was renamed from **Discovery Framework** to **Knowledge & Discovery Framework** to reflect scope beyond search — a unified knowledge layer across APZHUB.

| Before                         | After                                   |
| ------------------------------ | --------------------------------------- |
| Discovery Framework            | Knowledge & Discovery Framework         |
| Discovery Provider             | Knowledge Source                        |
| `@apzhub/discovery-framework`  | `@apzhub/knowledge-discovery-framework` |
| `discovery.providers` manifest | `knowledge.sources` manifest            |

Story IDs (DF-001–DF-018) are unchanged.

---

## Sprint objectives

1. Establish Knowledge Source Architecture (DF-001) ✅
2. Implement `@apzhub/knowledge-discovery-framework` package (DF-002–DF-009) ✅
3. Deliver Knowledge Experiences — overlay, palette knowledge mode (DF-010–DF-013) ✅
4. Knowledge Service + application integration in `apps/web` (DF-015) ✅
5. E2E verification (DF-016) ✅
6. Documentation, governance, production readiness (DF-017) ✅
7. Sprint closeout and milestone review (DF-018) ⏳

---

## Canonical layering

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

Architecture reference: [knowledge-discovery-framework.md](../architecture/knowledge-discovery-framework.md)

---

## Platform 2.0 constraints (unchanged)

- **No Runtime redesign**
- **No Workbench redesign**
- **No Action Framework executor changes**
- **No new execution pipeline** — [ADR-0029](../adr/ADR-0029-knowledge-discovery-execution-routing.md)
- **Registry reuse** — providers project Action and Workbench DTOs

---

## Story status

| Story  | Title                          | Status      |
| ------ | ------------------------------ | ----------- |
| DF-001 | Knowledge Source Architecture  | ✅ Complete |
| DF-002 | Package scaffold               | ✅ Complete |
| DF-003 | KnowledgeRegistry core         | ✅ Complete |
| DF-004 | Manifest bootstrap             | ✅ Complete |
| DF-005 | Server filter DTO              | ✅ Complete |
| DF-006 | Orchestrator                   | ✅ Complete |
| DF-007 | Action Registry provider       | ✅ Complete |
| DF-008 | Workbench navigation provider  | ✅ Complete |
| DF-009 | Ranking engine                 | ✅ Complete |
| DF-010 | Client hydration               | ✅ Complete |
| DF-011 | Client Knowledge Query API     | ✅ Complete |
| DF-012 | Knowledge Overlay              | ✅ Complete |
| DF-013 | Palette knowledge mode         | ✅ Complete |
| DF-014 | Ranking strategy scaffolds     | ✅ Complete |
| DF-015 | Knowledge Service + app wiring | ✅ Complete |
| DF-016 | E2E tests                      | ✅ Complete |
| DF-017 | Documentation                  | ✅ Complete |
| DF-018 | Sprint closeout                | ✅ Complete |

Spec index: [SPR-005-spec-index.md](../specs/SPR-005-spec-index.md)

---

## Key deliverables

| Document               | Path                                                                                                                              |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Subsystem architecture | [knowledge-discovery-framework.md](../architecture/knowledge-discovery-framework.md)                                              |
| Developer onboarding   | [knowledge-discovery-onboarding.md](../developer/knowledge-discovery-onboarding.md)                                               |
| Architecture review    | [SPR-005-architecture-review.md](../reviews/SPR-005-architecture-review.md)                                                       |
| Production readiness   | [MILESTONE-005-knowledge-discovery-production-readiness.md](../reviews/MILESTONE-005-knowledge-discovery-production-readiness.md) |
| Sprint closeout        | [SPR-005-closeout.md](./SPR-005-closeout.md)                                                                                      |
| Milestone review       | [MILESTONE-005-knowledge-discovery-framework-review.md](../reviews/MILESTONE-005-knowledge-discovery-framework-review.md)         |
| Release notes          | [v0.5.0-knowledge-discovery-framework.md](../releases/v0.5.0-knowledge-discovery-framework.md)                                    |

---

## Quality gates

Every story must pass:

```bash
pnpm lint && pnpm typecheck && pnpm build
pnpm test && pnpm test:coverage
pnpm test:e2e   # when UI/integration affected
```

At DF-018 closeout: **872 tests**, **24 E2E tests**, **91.55%** coverage.

---

_SPR-005 Knowledge & Discovery Framework Sprint Guide._
