# APZHUB Release 1.1 — Performance Backlog

> **Programme:** APZHUB-RELEASE-001  
> **Date:** 2026-07-19  
> **Note:** Repository evidence for measured performance defects is sparse; items below are evidence-linked opportunities, not invented SLOs.

| ID      | Item                                                             | Classification               | 1.1 candidate?               | Evidence basis                      |
| ------- | ---------------------------------------------------------------- | ---------------------------- | ---------------------------- | ----------------------------------- |
| PERF-01 | Search index population / query-path reviews for Projects Search | Performance Improvement      | **Maybe**                    | Projects KL (index dependency)      |
| PERF-02 | Law search ranking/filter paths under realistic datasets         | Performance Improvement      | **Maybe**                    | Law search tests exist; no SLA pack |
| PERF-03 | Outbox/event relay throughput under cross-product fan-out        | Performance Improvement      | **Maybe**                    | Event Bus/Outbox MVP maturity       |
| PERF-04 | Metabase/Analytics catalogue latency with in-memory registry     | Performance · Technical Debt | **Yes** (with SoR hardening) | Analytics KL                        |
| PERF-05 | Documents metadata query paths before any binary expansion       | Performance Improvement      | **Later**                    | Documents metadata-first            |

Do not invent numerical SLOs in this planning pack. Performance programmes must define measurements before optimisation work.
