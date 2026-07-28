# APZQEP-ENG-020B — Requirements Persistence & CRUD Foundation

> **Programme:** APZQEP-ENG-020B  
> **Title:** Requirements Persistence & CRUD Foundation  
> **Classification:** ENGINEERING IMPLEMENTATION  
> **Status:** **ACCEPTED / CLOSED**  
> **Baseline:** APZQEP-ENG-020A — **ACCEPTED / CLOSED**  
> **Package:** `@apzhub/qep-requirements` **0.2.0**  
> **Date accepted:** 2026-07-24  
> **Next:** [APZQEP-ENG-020C](../lifecycle/README.md)

## Purpose

Deliver the first functional Requirements vertical slice: persistence, repository adapters, application commands/queries, Platform authz/audit/search reuse, REST transport, and working UI for create/read/update/archive/list/search/detail.

## Pack

| Document         | Path                                           |
| ---------------- | ---------------------------------------------- |
| Persistence      | [PERSISTENCE.md](./PERSISTENCE.md)             |
| CRUD             | [CRUD.md](./CRUD.md)                           |
| Search           | [SEARCH.md](./SEARCH.md)                       |
| Authorization    | [AUTHORIZATION.md](./AUTHORIZATION.md)         |
| Audit            | [AUDIT.md](./AUDIT.md)                         |
| Testing          | [TESTING.md](./TESTING.md)                     |
| Completion       | [COMPLETION-REPORT.md](./COMPLETION-REPORT.md) |
| Owner acceptance | [OWNER-ACCEPTANCE.md](./OWNER-ACCEPTANCE.md)   |

## Scope boundary

| In scope                      | Out of scope               |
| ----------------------------- | -------------------------- |
| Persistence + migrations      | Approval workflows         |
| Repository adapters           | Baselines                  |
| CRUD + soft archive           | Historical version storage |
| Platform search product `qep` | Relationship graphs        |
| Permission enforcement        | Import/export              |
| Audit on mutations            | AI / MCP                   |
| Working list/detail/forms UI  | Certification workflows    |

## STOP

Await Owner Acceptance. Do **not** begin **APZQEP-ENG-020C** until Acceptance.
