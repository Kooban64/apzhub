# Attach-to-Work Analysis — APZ-DOCUMENTS-NATIVE-001-N01

| Field     | Value               |
| --------- | ------------------- |
| Slice     | N-01                |
| Status    | **COMPLETE**        |
| Timestamp | 20260805T141500Z    |
| Result    | **GAPS IDENTIFIED** |

## Preferred journeys (Owner)

> Attach document to Project · Ticket · Evidence · Contract

## Avoid

> Upload document · Browse repository as the starting point

## Observed journeys

| Journey                                | Present?               | Evidence                                             |
| -------------------------------------- | ---------------------- | ---------------------------------------------------- |
| Attach to Project                      | **No**                 | No Documents usage in Projects UI                    |
| Attach to Ticket                       | **No**                 | Support attachments ≠ Platform Documents             |
| Attach to Evidence                     | **No**                 | QEP evidence IDs, not Documents product              |
| Attach to Contract / Matter            | **Partial / separate** | Law Documents module — not platform Documents attach |
| Browse Documents repository (metadata) | **Yes — primary**      | Activity Bar → Documents workbench                   |
| Upload / browse files in Documents UI  | **No**                 | Explicitly metadata-only; no upload/viewer           |

## Primary mental model today

```text
Start → Documents (Activity Bar) → Browse / filter metadata → Inspect storage/diagnostics
```

## Target mental model (mission / Owner)

```text
Start → Work (Project / Ticket / Evidence / Matter) → Attach or open related document
        └── Documents capability governs lifecycle (service, not destination)
```

## Answer to Owner’s question

> When a user wants a document, do they start with the work, or do they start with the repository?

**Today: they start with the repository** (standalone Documents workbench).

That is the critical Lane 2 experience gap for Native Adoption. Domain contracts already anticipate attach-by-reference; product modules do not yet offer the journey.

## Gap IDs

G-14, G-15, G-16, G-17, G-18, G-22.

No solutions implemented in this slice.
