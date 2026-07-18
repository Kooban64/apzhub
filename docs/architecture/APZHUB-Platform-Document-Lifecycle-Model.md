# APZHUB Platform Document — Lifecycle Model

**Milestone:** APZDOCS-001  
**Status:** Transition catalogue only — no workflow engine

## States

`draft` · `active` · `archived` · `retained` · `deleted` · `restored` · `expired`

## Allowed transitions (summary)

| From     | To                                   |
| -------- | ------------------------------------ |
| draft    | active, archived, deleted            |
| active   | archived, retained, deleted, expired |
| archived | active, retained, deleted, restored  |
| retained | archived, expired, deleted           |
| deleted  | restored                             |
| restored | active, archived, deleted            |
| expired  | retained, deleted                    |

## Rules

- Invalid transitions raise `DocumentDomainError` (`invalid_lifecycle_transition`).
- Lifecycle changes are audited.
- No BPMN/workflow orchestration in this milestone.
