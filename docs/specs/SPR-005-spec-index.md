# SPR-005 — Technical Specification Index

> **Status:** Active — Sprint 005 closed (DF-018)  
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

| Document                                                                                                   | Stories        | Description                                                                                                  |
| ---------------------------------------------------------------------------------------------------------- | -------------- | ------------------------------------------------------------------------------------------------------------ |
| [SPR-005-KDF-knowledge-sources.md](./SPR-005-KDF-knowledge-sources.md)                                     | DF-001         | Knowledge Source architecture, taxonomy, registry integration, indexing/search overview, AI extension points |
| [SPR-005-KDF-knowledge-registry.md](./SPR-005-KDF-knowledge-registry.md)                                   | DF-003         | Knowledge Registry specification                                                                             |
| [SPR-005-KDF-knowledge-metadata.md](./SPR-005-KDF-knowledge-metadata.md)                                   | DF-003         | Registry metadata specification                                                                              |
| [SPR-005-KDF-knowledge-manifest.md](./SPR-005-KDF-knowledge-manifest.md)                                   | DF-004         | `knowledge.sources` manifest schema and extraction                                                           |
| [SPR-005-KDF-knowledge-bootstrap.md](./SPR-005-KDF-knowledge-bootstrap.md)                                 | DF-004         | Knowledge Registry bootstrap pipeline                                                                        |
| [SPR-005-KDF-knowledge-source-registry-dto.md](./SPR-005-KDF-knowledge-source-registry-dto.md)             | DF-005         | Server-facing Knowledge Registry DTO                                                                         |
| [knowledge-registry-relationship.md](../architecture/knowledge-registry-relationship.md)                   | DF-004         | Platform Manifest → Knowledge Registry canonical model                                                       |
| [SPR-005-KDF-client-hydration.md](./SPR-005-KDF-client-hydration.md)                                       | DF-010         | Client Knowledge Registry hydration                                                                          |
| [SPR-005-KDF-knowledge-service.md](./SPR-005-KDF-knowledge-service.md)                                     | DF-015         | Knowledge Service — public client boundary                                                                   |
| [SPR-005-KDF-knowledge-query-api.md](./SPR-005-KDF-knowledge-query-api.md)                                 | DF-011         | Internal Knowledge Query API                                                                                 |
| [SPR-005-KDF-knowledge-overlay.md](./SPR-005-KDF-knowledge-overlay.md)                                     | DF-012         | Knowledge Overlay — Knowledge Experience (modal)                                                             |
| [SPR-005-KDF-command-palette-knowledge.md](./SPR-005-KDF-command-palette-knowledge.md)                     | DF-013         | Command Palette — Knowledge Experience (knowledge mode)                                                      |
| [knowledge-views-model.md](../architecture/knowledge-views-model.md)                                       | DF-005, DF-010 | Knowledge Registry → Views → Experience model                                                                |
| [SPR-005-KDF-ranking-engine.md](./SPR-005-KDF-ranking-engine.md)                                           | DF-009         | Ranking Engine specification                                                                                 |
| [SPR-005-KDF-ranking-strategies.md](./SPR-005-KDF-ranking-strategies.md)                                   | DF-009, DF-014 | Ranking strategy reference                                                                                   |
| [SPR-005-KDF-ranking-strategy-extensions.md](./SPR-005-KDF-ranking-strategy-extensions.md)                 | DF-014         | Planned ranking strategy scaffolds                                                                           |
| [knowledge-retrieval-ranking-model.md](../architecture/knowledge-retrieval-ranking-model.md)               | DF-009         | Retrieval → Ranking → Experience model                                                                       |
| [knowledge-document-to-resource-evolution.md](../architecture/knowledge-document-to-resource-evolution.md) | DF-003         | KnowledgeResource evolution note (documentation only)                                                        |
| [knowledge-discovery-framework.md](../architecture/knowledge-discovery-framework.md)                       | DF-017         | Subsystem architecture — canonical reference                                                                 |
| [knowledge-discovery-onboarding.md](../developer/knowledge-discovery-onboarding.md)                        | DF-017         | Developer onboarding guide                                                                                   |
| [SPR-005 Architecture Review](../reviews/SPR-005-architecture-review.md)                                   | DF-017         | Formal architecture review                                                                                   |
| [MILESTONE-005 Production Readiness](../reviews/MILESTONE-005-knowledge-discovery-production-readiness.md) | DF-017         | Production readiness review                                                                                  |

---

## Story quick reference

| Story  | Title                                  | Spec section                                                                                                                                                                                              | ADR        |
| ------ | -------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| DF-001 | Knowledge Source Architecture          | [Knowledge Sources](./SPR-005-KDF-knowledge-sources.md)                                                                                                                                                   | 0027–0029  |
| DF-002 | Package scaffold                       | [Package README](../../packages/knowledge-discovery-framework/README.md)                                                                                                                                  | 0027       |
| DF-003 | KnowledgeRegistry core                 | [Registry spec](./SPR-005-KDF-knowledge-registry.md) · [Metadata spec](./SPR-005-KDF-knowledge-metadata.md)                                                                                               | 0028       |
| DF-004 | Manifest `knowledge.sources`           | [Manifest spec](./SPR-005-KDF-knowledge-manifest.md) · [Bootstrap spec](./SPR-005-KDF-knowledge-bootstrap.md)                                                                                             | 0028       |
| DF-005 | Server filter DTO                      | [DTO spec](./SPR-005-KDF-knowledge-source-registry-dto.md) · [Knowledge Views](../architecture/knowledge-views-model.md)                                                                                  | 0028, 0023 |
| DF-006 | KnowledgeDiscoveryOrchestrator         | [DF-006 completion report](../sprint/DF-006-completion-report.md)                                                                                                                                         | 0029       |
| DF-007 | Action Registry knowledge source       | [DF-007 completion report](../sprint/DF-007-completion-report.md) · providers                                                                                                                             | 0028, 0029 |
| DF-008 | Workbench navigation knowledge source  | [DF-008 completion report](../sprint/DF-008-completion-report.md)                                                                                                                                         | 0028, 0029 |
| DF-009 | Ranking scaffold (recency + frequency) | [Ranking Engine](./SPR-005-KDF-ranking-engine.md) · [Retrieval model](../architecture/knowledge-retrieval-ranking-model.md)                                                                               | 0028       |
| DF-010 | Client hydration + hooks               | [Client hydration spec](./SPR-005-KDF-client-hydration.md) · [Knowledge Views](../architecture/knowledge-views-model.md)                                                                                  | 0027       |
| DF-011 | Client Knowledge Query API             | [Query API spec](./SPR-005-KDF-knowledge-query-api.md) · [Knowledge Views](../architecture/knowledge-views-model.md)                                                                                      | 0027, 0029 |
| DF-012 | Knowledge Overlay                      | [Overlay spec](./SPR-005-KDF-knowledge-overlay.md) · [Knowledge Views](../architecture/knowledge-views-model.md)                                                                                          | 0029       |
| DF-013 | Palette integration                    | [Palette knowledge spec](./SPR-005-KDF-command-palette-knowledge.md) · [Knowledge Views](../architecture/knowledge-views-model.md)                                                                        | 0029       |
| DF-014 | Ranking strategy scaffolds             | [Strategy extensions](./SPR-005-KDF-ranking-strategy-extensions.md) · [Ranking Engine](./SPR-005-KDF-ranking-engine.md)                                                                                   | 0028       |
| DF-015 | Knowledge Service + app integration    | [Knowledge Service spec](./SPR-005-KDF-knowledge-service.md) · [Knowledge Views](../architecture/knowledge-views-model.md)                                                                                | 0027, 0029 |
| DF-016 | E2E tests                              | [DF-016 completion report](../sprint/DF-016-completion-report.md) · [spr-005 E2E](../../testing/playwright/e2e/spr-005-knowledge-discovery-framework.spec.ts)                                             | —          |
| DF-017 | Documentation                          | [Architecture](../architecture/knowledge-discovery-framework.md) · [Onboarding](../developer/knowledge-discovery-onboarding.md) · [DF-017 report](../sprint/DF-017-completion-report.md)                  | —          |
| DF-018 | Sprint closeout                        | [SPR-005 closeout](../sprint/SPR-005-closeout.md) · [M5 review](../reviews/MILESTONE-005-knowledge-discovery-framework-review.md) · [v0.5.0 release](../releases/v0.5.0-knowledge-discovery-framework.md) | —          |

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
