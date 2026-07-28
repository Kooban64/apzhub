# Lifecycle — APZQEP-ENG-050A

## States

`draft` · `under_review` · `approved` · `rejected` · `withdrawn` · `superseded` · `cancelled` · `retired`

## Transitions

```text
draft         → under_review | cancelled | withdrawn
under_review  → approved | rejected | draft | cancelled | withdrawn
approved      → superseded | withdrawn | retired
rejected      → draft | withdrawn | cancelled   # NOT approved
withdrawn / superseded / cancelled / retired → (terminal)
```

## Rules

- Only **Draft** may be edited.
- Only **Approved** may be authoritative.
- **Rejected** cannot become **Approved** directly.
- **Superseded** and **Retired** are immutable.
- Terminal states admit no further transitions.
