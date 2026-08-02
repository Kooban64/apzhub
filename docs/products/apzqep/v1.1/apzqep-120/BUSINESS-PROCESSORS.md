# Business Processors — APZQEP-120-S10

| Field     | Value                                   |
| --------- | --------------------------------------- |
| Programme | APZQEP-120                              |
| Slice     | S10 — Business Processor Integration    |
| Status    | **ACTIVE**                              |
| Package   | `@apzhub/qep-evidence` (processors)     |
| Engine    | `@apzhub/platform-processing` **0.1.0** |

## Nature of this slice

**S01–S09 built the platform. S10 begins consuming it.**

Business logic lives only in registered processors. The Processing Engine remains generic.

## Model

```text
Business Event
  → Registered Processor
    → Business Action
      → Processing Result
        → Acknowledged | Retry | Dead Letter
```

## Evidence processors (S10)

| Processor ID                          | Events                                        |
| ------------------------------------- | --------------------------------------------- |
| `qep.evidence.processor.created`      | `qep.evidence.created`                        |
| `qep.evidence.processor.updated`      | `qep.evidence.updated`                        |
| `qep.evidence.processor.lifecycle`    | `qep.evidence.lifecycle_changed`              |
| `qep.evidence.processor.integrity`    | `integrity_established`, `integrity_verified` |
| `qep.evidence.processor.archive`      | `qep.evidence.archived`                       |
| `qep.evidence.processor.supersession` | `qep.evidence.superseded`                     |
| `qep.evidence.processor.delete`       | `qep.evidence.deleted`                        |

## Extensibility

Product bundles (`ProductProcessorBundle`) register onto the platform registry. Evidence is the first bundle; Search (S11), Notifications (S12), Command Palette (S13), QI/AI later use the same registration mechanism without changing the engine.
