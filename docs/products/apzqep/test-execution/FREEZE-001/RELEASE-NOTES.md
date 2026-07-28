# Release Notes — Test Execution 1.0.0-rc.1

## Summary

First production Release Candidate for the APZ QEP **Test Execution** capability: Domain, Application, Infrastructure & API, and Workbench, certified **PRODUCTION_READY_WITH_LIMITATIONS**.

## Included

- Aggregate lifecycle: prepare → assign → execute → complete → review → accept/reject; pause/block/resume/cancel/supersede
- Sealed immutable manifest; outcome derivation; evidence references; observations
- External result ingestion API (trust boundary)
- REST `/api/v1/qep/executions/*` with platform authz (`qep.execution.*`)
- Workbench surfaces: home, explorer, assigned, review, create, detail, history
- Server-driven `availableActions` as sole UI action authority (ADR-0083)
- PostgreSQL schema + RLS migrations `0087` / `0088`
- Synchronous audit append; outbox enqueue for domain events

## Classification

**PRODUCTION_READY_WITH_LIMITATIONS**

## Known limitations (accepted)

| ID   | Summary                                  | Operational note                                                 |
| ---- | ---------------------------------------- | ---------------------------------------------------------------- |
| L-01 | OpenAPI not published for executions API | Use handler schemas / internal client until OpenAPI programme    |
| L-02 | EvidenceAccessPort default-allow         | **Controlled/pilot only** — mandatory fix before unrestricted GA |
| L-03 | Outbox enqueue-only                      | Do not depend on async notify/search from execution outbox       |
| L-04 | No Postgres integration tests            | Monitor migrations/RLS in deploy verification                    |

## Not in this RC

- Unrestricted GA claim
- Outbox dispatcher/worker
- Platform OpenAPI entries for executions
- Wired Evidence accessibility check
- Dedicated `/api/v1/qep/executions/health`

## Upgrade from prior state

Greenfield capability — apply migrations `0087` then `0088`, enable QEP platform services, deploy web app with module registration.
