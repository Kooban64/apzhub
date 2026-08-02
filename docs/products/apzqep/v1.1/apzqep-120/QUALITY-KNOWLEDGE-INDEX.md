# Quality Knowledge Index — APZQEP-120-S11

| Field     | Value                                    |
| --------- | ---------------------------------------- |
| Programme | APZQEP-120                               |
| Slice     | S11                                      |
| Package   | `@apzhub/qep-knowledge-index` **0.1.0**  |
| Status    | **ACTIVE** · Product Board **CERTIFIED** |

## Principle

> The Quality Knowledge Index is the enterprise read model for APZQEP.

| Model       | Owner                                                                                 |
| ----------- | ------------------------------------------------------------------------------------- |
| Write model | Business domains (Evidence, Suites, Runs, …)                                          |
| Read model  | Quality Knowledge Index                                                               |
| Consumers   | Search, Notifications (S12), **Command Platform (S13)**, AI, QI, Executive Dashboards |

## Platform Architecture Rule

```text
The Search Platform SHALL consume the Event Platform.

The Search Platform SHALL NOT query business services to construct projections.

Business domains remain authoritative.

Search builds projections.

Search is eventually consistent.
```

Not an Enterprise Standard.

## Pipeline

```text
Business Event → Outbox → Processing Engine
        → Evidence Processor (S10)
        → Knowledge Index Processor (S11)
        → Notification Processor (S12)  ← subscribes; does not query SoR
              → Projection Repository
                    → Search Query Service
                    → Command Platform Discovery (S13)
```

## Initial domain

Evidence only (metadata, lifecycle, integrity, relationships, ownership, tags, classification, audit refs, keywords). No binary content.
