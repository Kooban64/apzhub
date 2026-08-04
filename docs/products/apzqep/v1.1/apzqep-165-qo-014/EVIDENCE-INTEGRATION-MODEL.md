# Evidence Integration Model

## Principles

1. **Evidence is authoritative. Reports are derived views.** Reports never become evidence.
2. **Evidence is referenced, never copied.** Every reference points to an authoritative source.
3. **Traceability is immutable** from report → Evidence Integration Package → artefacts → audit.

## Responsibility

Bind authoritative artefacts into a unified, traceable package and expose declarative reporting
over that package. Do not create, alter, or replace evidence.

## Hierarchy

| Role            | Artefacts                                                                                                                                                                                             |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Authoritative   | Quality Flow, Impact Graph, Governance Decision, Approval Bundle, Decision Package, Automation Coordination Package, Source Change Package, Enrichment Package (advisory SoR), Evidence Platform refs |
| Integration SoR | Evidence Integration Package (refs only)                                                                                                                                                              |
| Derived views   | Report Views (never SoR)                                                                                                                                                                              |

## Persistence

Uses the existing orchestration in-memory persistence model. Future durable evidence
integration persistence is deferred and must remain reference-only.
