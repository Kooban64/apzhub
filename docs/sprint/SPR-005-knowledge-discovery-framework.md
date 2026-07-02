# SPR-005 — Knowledge & Discovery Framework

> **Sprint:** SPR-005  
> **Milestone:** 5 — Knowledge & Discovery Framework  
> **Status:** In progress — **DF-001 complete, await review before DF-002**  
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
2. Implement `@apzhub/knowledge-discovery-framework` package (DF-002–DF-009)
3. Deliver shell surfaces — header search, overlay, palette integration (DF-010–DF-013)
4. Wire application integration in `apps/web` (DF-015)
5. Document, test, and close Milestone 5 (DF-016–DF-018)

---

## Platform 2.0 constraints (unchanged)

- **No Runtime redesign**
- **No Workbench redesign**
- **No Action Framework executor changes**
- **No new execution pipeline** — [ADR-0029](../adr/ADR-0029-knowledge-discovery-execution-routing.md)
- Consume existing registries — no duplication

---

## Story progress

| Story  | Title                                 | Status                        |
| ------ | ------------------------------------- | ----------------------------- |
| DF-001 | Knowledge Source Architecture         | ✅ Complete — await review    |
| DF-002 | Package scaffold                      | ⏳ Blocked on DF-001 approval |
| DF-003 | KnowledgeSourceRegistry core          | Pending                       |
| DF-004 | Manifest `knowledge.sources`          | Pending                       |
| DF-005 | Server filter DTO                     | Pending                       |
| DF-006 | KnowledgeDiscoveryOrchestrator        | Pending                       |
| DF-007 | Action Registry knowledge source      | Pending                       |
| DF-008 | Workbench navigation knowledge source | Pending                       |
| DF-009 | Ranking scaffold                      | Pending                       |
| DF-010 | Client hydration + hooks              | Pending                       |
| DF-011 | Header search UI                      | Pending                       |
| DF-012 | Knowledge discovery overlay           | Pending                       |
| DF-013 | Palette integration                   | Pending                       |
| DF-014 | Semantic / AI stubs                   | Pending                       |
| DF-015 | Application integration               | Pending                       |
| DF-016 | E2E tests                             | Pending                       |
| DF-017 | Documentation                         | Pending                       |
| DF-018 | Sprint closeout                       | Pending                       |

---

## Key deliverables (DF-001)

| Deliverable                     | Path                                                                          |
| ------------------------------- | ----------------------------------------------------------------------------- |
| Knowledge Source specification  | [SPR-005-KDF-knowledge-sources.md](../specs/SPR-005-KDF-knowledge-sources.md) |
| Spec index                      | [SPR-005-spec-index.md](../specs/SPR-005-spec-index.md)                       |
| ADR-0027 Package                | [ADR-0027](../adr/ADR-0027-knowledge-discovery-framework-package.md)          |
| ADR-0028 Knowledge Source model | [ADR-0028](../adr/ADR-0028-knowledge-source-model.md)                         |
| ADR-0029 Execution routing      | [ADR-0029](../adr/ADR-0029-knowledge-discovery-execution-routing.md)          |
| Completion report               | [DF-001-completion-report.md](./DF-001-completion-report.md)                  |

---

## Quality gates

All stories must pass:

```bash
pnpm lint && pnpm typecheck && pnpm build && pnpm test && pnpm test:coverage
```

E2E when UI/integration affected.

---

## Stop condition

**Do not begin DF-002** until DF-001 completion report is reviewed and ADRs 0027–0029 are confirmed.

---

_SPR-005 Knowledge & Discovery Framework — sprint planning document._
