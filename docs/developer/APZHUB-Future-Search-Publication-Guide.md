# APZHUB Future Search Publication Guide

> **Status:** Roadmap only — **not authorised for implementation**  
> **Programme:** Search Publication (closed / **Architecture Frozen** at APZSEARCH-019)  
> **Date:** 2026-07-18

---

## Purpose

Document possible future evolution of Search Publication **without** implementing any of it. The current architecture remains frozen. Any item below requires ADR + owner approval + architecture review + a new milestone before work begins.

**Do not implement** capabilities from this guide under APZSEARCH-019 or as drive-by changes.

---

## Future work (candidates only)

| Theme                      | Description                                                                    | Status                  |
| -------------------------- | ------------------------------------------------------------------------------ | ----------------------- |
| Distributed orchestration  | Multi-instance drain coordination, leader election / lease-based claiming      | Future — not authorised |
| Multi-node scheduling      | Cluster-aware batch scheduling and fair product queues                         | Future — not authorised |
| Advanced retry policies    | Per-product / per-error-class policies, jitter profiles, circuit-aware backoff | Future — not authorised |
| Provider federation        | Multi-engine publication routing beyond the certified Meilisearch path         | Future — not authorised |
| Event-driven publication   | Platform Event Bus as an alternate/enqueue trigger path                        | Future — not authorised |
| Publication analytics      | Throughput, lag, failure-rate reporting planes                                 | Future — not authorised |
| Observability enhancements | Deeper OTel spans, SLO dashboards for publication lag                          | Future — not authorised |
| AI-assisted diagnostics    | Automated failure classification / remediation suggestions                     | Future — not authorised |
| Durable admin overlay      | PostgreSQL-backed admin markers and audit (addresses known limitation)         | Future — not authorised |
| Indexed admin query plane  | Replace in-memory `listByStatus` aggregation for large journals                | Future — not authorised |

---

## Explicit non-goals (remain excluded)

- Semantic / vector search inside publication
- Changing frozen Search Platform query contracts without a Search Platform programme
- Module-to-module publication coupling
- Embedding provider credentials in publication packages

---

## Evolution process

See [Architecture Freeze Notice](../architecture/APZHUB-Search-Publication-Architecture-Freeze-Notice.md) — ADR → owner approval → architecture review → new milestone → re-certification.

---

## Related

- [Reference Standard](../architecture/APZHUB-Search-Publication-Reference-Standard.md)
- [APZSEARCH-019 Completion Report](../sprint/APZSEARCH-019-completion-report.md)
