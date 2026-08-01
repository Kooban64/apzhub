# APZQEP-120 — Enterprise Core Platform

| Field                     | Value                                                                                                                                                                                                                                                       |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Programme                 | **APZQEP-120**                                                                                                                                                                                                                                              |
| Title                     | Enterprise Core Platform                                                                                                                                                                                                                                    |
| Classification            | **Engineering Execution Planning** + slice engineering                                                                                                                                                                                                      |
| Planning status           | **COMPLETE**                                                                                                                                                                                                                                                |
| Implementation authority  | **OPEN** (per-slice)                                                                                                                                                                                                                                        |
| Active / completed slices | **S01–S04 COMPLETE** — [S01](./S01-ENGINEERING-NOTES.md) · [S02](./S02-ENGINEERING-NOTES.md) · [S03](./S03-ENGINEERING-NOTES.md) · [S04](./S04-ENGINEERING-NOTES.md) · [Storage](./STORAGE-PLATFORM.md) · [Integrity](../../EVIDENCE-INTEGRITY-PLATFORM.md) |
| Product positioning       | [../PRODUCT-POSITIONING.md](../PRODUCT-POSITIONING.md) — Enterprise Quality Engineering Platform                                                                                                                                                            |
| Inspected HEAD            | `4ff22aac6d250241383bda9c7b281b3bfc2c48d9`                                                                                                                                                                                                                  |
| Baseline                  | APZQEP v1.0 · Evidence **1.0.0** · TE **1.0.1** · LIMITED_AVAILABILITY                                                                                                                                                                                      |
| Architecture              | APZQEP-111 **APPROVED**                                                                                                                                                                                                                                     |
| Date                      | 2026-08-01                                                                                                                                                                                                                                                  |

---

## Purpose

Convert APZQEP-111 architecture into **independently testable, certifiable, releasable engineering slices** for the Enterprise Core Platform — without implementing product functionality in this programme.

---

## Pack

| Document                                                                         | Role                               |
| -------------------------------------------------------------------------------- | ---------------------------------- |
| [OWNER-APPROVAL-SUMMARY.md](./OWNER-APPROVAL-SUMMARY.md)                         | Board decision surface             |
| [CURRENT-STATE-ASSESSMENT.md](./CURRENT-STATE-ASSESSMENT.md)                     | Repository-grounded assessment     |
| [ENGINEERING-EXECUTION-PLAN.md](./ENGINEERING-EXECUTION-PLAN.md)                 | Programme plan overview            |
| [WORKSTREAMS.md](./WORKSTREAMS.md)                                               | Workstreams A–J                    |
| [SLICE-CATALOGUE.md](./SLICE-CATALOGUE.md)                                       | **S01–S20** executable slice specs |
| [IMPLEMENTATION-SEQUENCE.md](./IMPLEMENTATION-SEQUENCE.md)                       | Critical path & parallelism        |
| [DEPENDENCY-MAP.md](./DEPENDENCY-MAP.md)                                         | Dependencies                       |
| [QUALITY-PLAN.md](./QUALITY-PLAN.md)                                             | Test & certification strategy      |
| [SECURITY-PLAN.md](./SECURITY-PLAN.md)                                           | Security gates                     |
| [DATA-AND-MIGRATION-PLAN.md](./DATA-AND-MIGRATION-PLAN.md)                       | Schema & storage                   |
| [API-AND-EVENT-COMPATIBILITY.md](./API-AND-EVENT-COMPATIBILITY.md)               | Contracts                          |
| [RELEASE-STRATEGY.md](./RELEASE-STRATEGY.md)                                     | Release boundaries                 |
| [RISK-REGISTER.md](./RISK-REGISTER.md)                                           | Risks                              |
| [DECISION-REGISTER.md](./DECISION-REGISTER.md)                                   | Owner decisions                    |
| [ACCEPTANCE-AND-CERTIFICATION-GATES.md](./ACCEPTANCE-AND-CERTIFICATION-GATES.md) | Gates                              |

Parent architecture: [../ENGINEERING-PROGRAMMES.md](../ENGINEERING-PROGRAMMES.md) · [../SOLUTION-ARCHITECTURE.md](../SOLUTION-ARCHITECTURE.md)

---

## Explicitly deferred (not APZQEP-120)

Suites · Runs · Defects (**130**) · Executive dashboards depth (**140**) · AI skills (**150**) · Coverage/Cert engine (**160**) · ALM sync (**170**) · GA programme (**180**)

---

## STOP

```text
APZQEP-120 PLANNING COMPLETE
IMPLEMENTATION AUTHORITY NOT GRANTED
AWAITING PRODUCT BOARD REVIEW
```
