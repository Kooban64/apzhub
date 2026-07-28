# State Machine

## States

| State         | Description                  |
| ------------- | ---------------------------- |
| `draft`       | Initial editable state       |
| `proposed`    | Submitted for consideration  |
| `in_review`   | Under active review          |
| `approved`    | Accepted requirement         |
| `rejected`    | Rejected during review       |
| `implemented` | Implementation complete      |
| `verified`    | Verification complete        |
| `deprecated`  | Superseded but retained      |
| `archived`    | Soft-archived terminal state |

## Diagram

```mermaid
stateDiagram-v2
  [*] --> draft
  draft --> proposed : submit
  proposed --> in_review : review / start_review
  in_review --> approved : approve
  in_review --> rejected : reject
  approved --> implemented : mark_implemented
  implemented --> verified : mark_verified
  verified --> deprecated : deprecate
  deprecated --> archived : archive
  rejected --> draft : revise
  rejected --> archived : archive
  archived --> [*]
```

## Terminal behaviour

`archived` has no outbound transitions. Soft-delete metadata (`archivedAt`, `archivedBy`) is set when entering `archived`.
