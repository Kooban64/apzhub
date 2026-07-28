# APZQEP-OES-ARCH-012  
# APPENDIX D — Navigation Maps

## D.1 Shell map

```text
Activity Bar: QEP
└── Sidebar: Test Specifications
      ├── Dashboard ──────────► S-01
      ├── Explorer ───────────► S-02 ──select──► S-05 Inspector
      ├── Review ─────────────► S-03 ──select──► S-05
      └── Search ─────────────► S-04 ──open────► S-05
```

## D.2 Inspector secondary nav

```text
S-05 Inspector
  ├── History ────────► S-06
  ├── Versions ───────► S-07 ──compare──► S-09
  └── Relationships ──► S-08 ──foreign──► Requirements / Trace / Verification
                                          or Governed unavailable
```

## D.3 Cross-capability

| From | To |
| ---- | -- |
| Spec relationship `requirement` | Requirements Workbench artefact |
| Spec relationship `trace_link` | Traceability Workbench artefact |
| Spec relationship `verification` | Verification Workbench artefact |
| Foreign capability deep link in | `…/specifications/{id}` |

## D.4 Query persistence

Explorer filters (`status`, `owner`, `type`, `classification`, `q`, …) SHOULD round-trip in the URL and session preferences (Part 2).

## END OF APPENDIX D
