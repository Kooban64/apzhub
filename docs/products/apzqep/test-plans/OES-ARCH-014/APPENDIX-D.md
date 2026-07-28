# APZQEP-OES-ARCH-014 — APPENDIX D — Navigation Maps

## Activity Bar → Sidebar → Workspace

```text
APZ QEP (Activity)
  └── Test Plans (Sidebar)
        ├── Dashboard
        ├── Explorer
        ├── Review
        └── Search
```

## Inspector children

```text
Plan Inspector
  ├── Summary
  ├── Metadata
  ├── Items / Linked Specifications
  ├── Relationships
  ├── History
  ├── Versions → Compare (governed unavailable, L-01)
  └── Audit
```

## Cross-capability deep links (consume existing)

| From Test Plans | To |
| ----------------- | -- |
| Plan Item row | Test Specifications Inspector |
| Requirement reference | Requirements Workbench |
| Trace Link reference | Traceability Workbench |
| Verification subject reference | Verification Inspector |
| Future Execution / Run / Evidence / Defect | Governed unavailable — capability does not yet exist |

## Inbound deep links (consumed by Test Plans)

| From | To Test Plans |
| ---- | --------------- |
| Notification / Attention Engine delivery | `/plans/{planId}` |
| Global Unified Search result | `/plans/{planId}` |
| Future Execution capability | `/plans/{planId}` (read reference) |

## Session restore scope

```text
Persisted (Workspace Sessions / Preference Service):
  - Explorer filters, sort, page
  - Selected planId
  - Active Inspector panel tab

Never persisted client-side:
  - Plan content, status, availableActions
  - Approval decisions, history, audit rows
```

## Permission filtering

Sidebar children, Dashboard widgets, Explorer create affordance, Review queue visibility, and every action control **SHALL** be permission-filtered at render time; the server remains authoritative (Part 2 §11 / Part 5 §4).
