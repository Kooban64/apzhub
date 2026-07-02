# SPR-005 — Technical Specification Index

> **Status:** Active — DF-001 complete  
> **Sprint:** SPR-005 — Knowledge & Discovery Framework  
> **Authority:** [SPR-005 backlog](../backlog/SPR-005-knowledge-discovery-framework-backlog.md) · ADRs 0027–0029

---

## ADRs (DF-001)

| ADR                                                                  | Title                                   | Status   |
| -------------------------------------------------------------------- | --------------------------------------- | -------- |
| [ADR-0027](../adr/ADR-0027-knowledge-discovery-framework-package.md) | Knowledge & Discovery Framework Package | Accepted |
| [ADR-0028](../adr/ADR-0028-knowledge-source-model.md)                | Knowledge Source Model and Taxonomy     | Accepted |
| [ADR-0029](../adr/ADR-0029-knowledge-discovery-execution-routing.md) | Knowledge Discovery Execution Routing   | Accepted |

---

## Specification documents

| Document                                                               | Stories         | Description                                                                                                  |
| ---------------------------------------------------------------------- | --------------- | ------------------------------------------------------------------------------------------------------------ |
| [SPR-005-KDF-knowledge-sources.md](./SPR-005-KDF-knowledge-sources.md) | DF-001          | Knowledge Source architecture, taxonomy, registry integration, indexing/search overview, AI extension points |
| Foundation spec (planned)                                              | DF-002 – DF-009 | Package, registry, manifest, filter, orchestrator, sources, ranking — **DF-002+**                            |
| Surfaces spec (planned)                                                | DF-010 – DF-013 | Client hydration, header search, overlay, palette — **DF-010+**                                              |
| Integration spec (planned)                                             | DF-014 – DF-018 | AI stubs, app wiring, E2E, docs, closeout — **DF-014+**                                                      |

---

## Story quick reference

| Story  | Title                                  | Spec section                                            | ADR          |
| ------ | -------------------------------------- | ------------------------------------------------------- | ------------ |
| DF-001 | Knowledge Source Architecture          | [Knowledge Sources](./SPR-005-KDF-knowledge-sources.md) | 0027–0029    |
| DF-002 | Package scaffold                       | Planned foundation spec                                 | 0027         |
| DF-003 | KnowledgeSourceRegistry core           | Planned foundation spec                                 | 0028         |
| DF-004 | Manifest `knowledge.sources`           | Planned foundation spec                                 | 0028         |
| DF-005 | Server filter DTO                      | Planned foundation spec                                 | 0028, 0023   |
| DF-006 | KnowledgeDiscoveryOrchestrator         | Planned foundation spec                                 | 0029         |
| DF-007 | Action Registry knowledge source       | Planned foundation spec                                 | 0028, 0029   |
| DF-008 | Workbench navigation knowledge source  | Planned foundation spec                                 | 0028, 0029   |
| DF-009 | Ranking scaffold (recency + frequency) | Planned foundation spec                                 | 0028         |
| DF-010 | Client hydration + hooks               | Planned surfaces spec                                   | 0027         |
| DF-011 | Header search UI                       | Planned surfaces spec                                   | Document 020 |
| DF-012 | Knowledge discovery overlay            | Planned surfaces spec                                   | 0029         |
| DF-013 | Palette integration                    | Planned surfaces spec                                   | 0029         |
| DF-014 | Semantic / AI stubs                    | Planned integration spec                                | 0029         |
| DF-015 | Application integration                | Planned integration spec                                | 0027         |
| DF-016 | E2E tests                              | Planned integration spec                                | —            |
| DF-017 | Documentation                          | Planned integration spec                                | —            |
| DF-018 | Sprint closeout                        | Planned integration spec                                | —            |

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

DF-001 is documentation-only — gates must remain green (no regression).

---

_SPR-005 Technical Specification Index — maintained through sprint closeout (DF-018)._
