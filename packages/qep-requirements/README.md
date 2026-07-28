# `@apzhub/qep-requirements`

APZ QEP Requirements bounded context.

| Programme       | Scope                                                                                              | Status                           |
| --------------- | -------------------------------------------------------------------------------------------------- | -------------------------------- |
| APZQEP-ENG-020A | Domain foundation (DDD skeleton)                                                                   | **ACCEPTED / CLOSED**            |
| APZQEP-ENG-020B | Persistence & CRUD foundation                                                                      | **ACCEPTED / CLOSED**            |
| APZQEP-ENG-020C | Lifecycle engine integration                                                                       | **ACCEPTED / CLOSED**            |
| APZQEP-ENG-020D | Append-only requirement content versioning                                                         | **ACCEPTED / CLOSED / COMPLETE** |
| APZQEP-ENG-020E | Requirement Baselines — domain, application, persistence, API, integrity, Workbench UI (Parts 1–3) | **ACCEPTED / CLOSED / COMPLETE** |

## Current capabilities (0.7.0)

- Domain model + value objects
- Persistence (PostgreSQL + in-memory test adapters)
- CRUD: create / read / update / archive / list / search
- Lifecycle transitions via `@apzhub/lifecycle-engine` (status not mutable via CRUD update)
- Lifecycle history, audit triad, domain events
- Canonical content snapshots with SHA-256 integrity hashes and append-only history
- Content-version API contract, authorization, HTTP transport, and Workbench history/comparison UI
- Content migration backfill (intentionally does not generate Platform business audit records)
- Platform authz / search publication
- Workbench UI (list, detail, forms, lifecycle actions)
- Requirement Baselines: domain aggregate + lifecycle policy (draft → locked → archived, no reverse/unlock)
- Baseline integrity fingerprinting (SHA-256 canonical hash over membership + content-version snapshots) with empty-lock rejection and `verifyBaselineIntegrity`
- Baseline application service, PostgreSQL + in-memory persistence, REST API, permissions, and Workbench UI (list, create, detail, add/remove version, lock/archive/verify confirmations, compare, Requirement Baseline History panel)

## Docs

- [Domain foundation](../../docs/products/apzqep/requirements/domain-foundation/README.md)
- [CRUD foundation](../../docs/products/apzqep/requirements/crud-foundation/README.md)
- [Lifecycle](../../docs/products/apzqep/requirements/lifecycle/README.md)
- [Content versioning](../../docs/products/apzqep/requirements/versioning/README.md)
- [Baselines](../../docs/products/apzqep/requirements/baselines/README.md)
- [Owner Acceptance](../../docs/products/apzqep/requirements/baselines/OWNER-ACCEPTANCE.md)

## ENG-020E boundary (accepted)

ENG-020E delivers the Requirement Baselines domain, application, persistence, API,
integrity fingerprinting, and Workbench UI. It does not add clone, unlock, restore,
delete, merge, import/export, requirement relationships, Verification domain
capabilities, AI, or MCP integration. Programme status is **ACCEPTED / CLOSED / COMPLETE**.
Next programme (**APZQEP-ENG-020F** — Requirements Relationship Model) is **PLANNING ONLY**.
