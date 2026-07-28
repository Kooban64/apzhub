# Requirements Engineering Summary

## Capability composition

```text
Presentation (Workbench)
  → Platform Services / Application Services (@apzhub/qep-requirements)
    → Persistence (PostgreSQL / in-memory)
      → Platform cross-cuts (authz, audit, search projection, observability)
```

## Engineering programmes (closed)

| ID | Focus | Outcome |
| -- | ----- | ------- |
| ENG-020A | Domain foundation | Requirement aggregate, identity, invariants |
| ENG-020B | Persistence & CRUD | Repositories, mappers, APIs for core CRUD |
| ENG-020C | Lifecycle | State machine, history, transition services |
| ENG-020D | Content Versioning | Append-only CV, integrity, comparison |
| ENG-020E | Baselines | Membership lock, fingerprint, Workbench |
| ENG-020F | Relationships | Domain + persistence/API + Workbench |
| ARCH-005 | Relationship semantics | Authoritative type/lifecycle/scope rules |
| ARCH-006 | Workbench UX grammar | Multi-pane, list-first, availableActions |

## Package baseline

| Field | Value |
| ----- | ----- |
| Package | `@apzhub/qep-requirements` |
| Version | **1.0.0** |
| Module | `modules/qep-requirements` **1.0.0** |
| Migrations | **0072**–**0078** |
| Companion | `@apzhub/lifecycle-engine`, `@apzhub/qep-contracts`, `@apzhub/search-qep` |

## Boundary discipline (certified)

- Business rules in domain/application services — not in React views
- Connectors/backends not called from modules
- Search never authoritative
- UI mutations only when `availableActions` permits
