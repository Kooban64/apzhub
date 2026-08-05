# Work Completion Journey — Operational Metric

| Field     | Value                             |
| --------- | --------------------------------- |
| Status    | **DEFINED**                       |
| Timestamp | 20260805T104500Z                  |
| Kind      | User / operational metric         |
| Scope     | Unified Work Experience (My Work) |
| Not       | Engineering KPI · Quality gate    |

## Purpose

Measure whether **My Work** reduces friction — whether users can see obligations, act, and complete work without product-hopping as the primary mental model.

This is a **user metric**, not an engineering or quality metric.

## Success criterion

Not “users opened My Work.”

Success is:

> **Users stopped thinking about which product to open.**

Operationally, My Work helps them answer:

> **What do I need to do next?**

Reviewed in [APZHUB-MY-WORK-REVIEW.md](./APZHUB-MY-WORK-REVIEW.md).

## Measures

| Measure                   | Meaning                                               |
| ------------------------- | ----------------------------------------------------- |
| Work items surfaced       | Count of cards presented in My Work queues            |
| Work items opened         | Count of cards activated (navigation to product href) |
| Work items completed      | Count of obligations resolved in owning products      |
| Time to first action      | Latency from surface → first open                     |
| Time to completion        | Latency from surface → completion in owning product   |
| Navigation path           | Sequence of views after open                          |
| Cross-product transitions | Moves between product workspaces within a journey     |

## Rules

1. **Observe before instrumenting heavily** — start with available analytics / session evidence; do not invent a parallel telemetry programme.
2. **Never create a My Work SoR** — journey metrics are derived / observational.
3. **Completions remain in product Systems of Record** — the metric consumes product outcomes; it does not redefine them.
4. **Permission-respecting** — measurements never include work the user could not see.
5. **No vanity dashboards** — report only what informs the next capability decision.

## How evidence is used

| Signal                                         | Interpretation                                   |
| ---------------------------------------------- | ------------------------------------------------ |
| High surface, low open                         | Cards unclear, wrong priority, or trust gap      |
| High open, low completion                      | Product friction after handoff                   |
| Long time to first action                      | Queue noise or weak “Needs My Attention” ranking |
| Frequent cross-product thrash without progress | Context / composition gap (not a new SoR)        |

Evidence feeds Product Board / QPR. It does **not** auto-authorise engineering.

## Relationship to capability lifecycle

```text
Capability Definition → Portfolio Validation → Engineering → Operational Adoption
                                                              ↑
                                              Work Completion Journey lives here
```

## Explicit non-goals

- Not a substitute for APZQEP quality metrics
- Not a sprint velocity metric
- Not authorisation to build Notifications / Search / Executive Workspace without pause evidence
