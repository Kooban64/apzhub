# APZQEP-OES-ARCH-013 — APPENDIX D — Navigation Maps

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
  ├── Linked Specifications (Items)
  ├── Coverage (projection)
  ├── Relationships
  ├── History
  └── Versions → Compare
```

## Cross-capability deep links (consume existing)

| From Plans                     | To                                                  |
| ------------------------------ | --------------------------------------------------- |
| Plan Item row                  | Test Specifications Inspector                       |
| Requirement reference          | Requirements Workbench                              |
| Verification subject reference | Verification Inspector                              |
| Future Execution               | Test Execution Workbench (unavailable until exists) |

## Permission filtering

Sidebar children and commands **SHALL** be permission-filtered at render time; server remains authoritative.
