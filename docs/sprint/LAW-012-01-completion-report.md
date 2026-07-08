# LAW-012-01 — Persistence Architecture & Data Model Completion Report

> **Story:** LAW-012-01 — Persistence Architecture & Data Model  
> **Status:** **Complete** — architecture only; await owner approval before LAW-012-02 implementation  
> **Platform baseline:** [Platform Version 5.0](../releases/APZHUB-Platform-v5.0.md) — **frozen**

---

## Summary

LAW-012-01 designs the persistence architecture for the Law Platform based on the validated in-memory implementation (LAW-002 through LAW-011) and the canonical domain model. No database, SQL, migrations, ORM, API, or Platform changes were made.

---

## Deliverables

| Deliverable                                         | Location                                                                                         |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| **Architecture document**                           | [LAW-012-01-Persistence-Architecture.md](../architecture/LAW-012-01-Persistence-Architecture.md) |
| Aggregate diagrams                                  | §3.2, §3.4 in architecture doc                                                                   |
| Repository diagrams                                 | §4.1–4.4 in architecture doc                                                                     |
| Transaction diagrams                                | §5.1–5.2 in architecture doc                                                                     |
| Conceptual ER diagram                               | §6.1 in architecture doc                                                                         |
| Search / audit / activity / notification strategies | §7–10 in architecture doc                                                                        |
| Security & reporting                                | §12–13 in architecture doc                                                                       |
| Technical debt register                             | §14 in architecture doc                                                                          |
| Persistence roadmap                                 | §15 in architecture doc                                                                          |
| LAW-012-02 recommendation                           | §16 in architecture doc                                                                          |

---

## Architecture validation

| Constraint                                      | Result                    |
| ----------------------------------------------- | ------------------------- |
| No implementation                               | Pass — documentation only |
| No database / SQL / ORM                         | Pass                      |
| No API                                          | Pass                      |
| No Platform modifications                       | Pass                      |
| Grounded in LAW-011-01 E2E validation           | Pass                      |
| Aligns with canonical domain model §3 ownership | Pass                      |
| Preserves workflow service boundary             | Pass                      |

---

## Key design decisions

1. **Seven aggregate roots** map 1:1 to validated workflow services (Client, Matter, Document, Task, CalendarEvent, TimeEntry, Invoice).
2. **Repository adapters** implement existing writable interfaces; in-memory adapters remain for tests.
3. **Unit of Work** scopes single-aggregate commits; Invoice↔TimeEntry billing sync uses a documented saga.
4. **Search projections** replace live repository queries via event-driven `search_document` denormalisation.
5. **Activity and Notification** remain Platform-owned projections — legal publishes events only.
6. **Tenant isolation** via `tenant_id` + RLS on all operational tables.

---

## Product validation inputs consumed

- `matter-lifecycle.integration.test.ts` — 12-step lifecycle transaction boundaries
- `matter-workspace-composition.ts` — read model requirements
- `register-legal-search-knowledge.ts` — seven entity search providers
- LAW-009/010/011 completion reports — technical debt items TD-L011-01 through TD-L011-06

---

## Recommendation for LAW-012-02

Implement **Persistence Foundation** — PostgreSQL adapters for Client and Matter, tenant context, UoW skeleton, outbox table, and feature-flagged adapter switching — without changing workflow signatures or Platform integrations.

See [§16 of the architecture document](../architecture/LAW-012-01-Persistence-Architecture.md#16-recommendation-for-law-012-02).

---

## Stop condition

LAW-012-01 is complete. Stopped per story scope — **no persistence implementation begun**.

Await owner approval before LAW-012-02.
