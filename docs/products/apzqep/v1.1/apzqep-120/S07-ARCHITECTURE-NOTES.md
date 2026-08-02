# APZQEP-120-S07 — Architecture Notes

| Field  | Value          |
| ------ | -------------- |
| Slice  | APZQEP-120-S07 |
| Status | COMPLETE       |

## Sequence (publish path)

```mermaid
sequenceDiagram
  participant Client
  participant App as Application Service
  participant Domain
  participant Repo as Repository
  participant Pub as Event Publisher

  Client->>App: mutate evidence
  App->>Domain: apply rules + domain events
  App->>Repo: save aggregate
  App->>Pub: publish catalogue envelope(s)
  Note over Repo: No event publish
  Note over Pub: Fail-soft; idempotency key
```

## Layer rules

| Layer                    | May publish business events?    |
| ------------------------ | ------------------------------- |
| Application Services     | **YES**                         |
| Domain                   | Semantics only (in-proc events) |
| Repositories             | **NO**                          |
| Storage providers        | **NO**                          |
| Infrastructure transport | Transport only (S08+)           |

## Product asset

Event definitions are documented under `docs/products/apzqep/events/` — not buried solely in code.
