# APZHUB Service Levels (SLA / OLA / KPI)

> **Programme:** APZHUB-OPERATIONS-001  
> **Date:** 2026-07-20  
> **Honesty:** Targets below are **operational governance defaults** for Platform **1.1.0** PRWL — not commercial contracts unless Owner publishes otherwise.

---

## Operational SLAs (Production — defaults)

| Service class                                  | Availability target | Notes                                  |
| ---------------------------------------------- | ------------------- | -------------------------------------- |
| Tier A (Identity, Gateway, AuthZ, Platform DB) | 99.5% monthly       | Measured via health + synthetic checks |
| Tier B (product paths)                         | 99.0% monthly       | Per-product; engine downtime counts    |
| Tier C (Attention, Automation journal)         | Best effort         | Degraded UX acceptable                 |

## Incident response OLAs

| Severity | Acknowledge     | Update cadence | Resolve target  |
| -------- | --------------- | -------------- | --------------- |
| P1       | 15 min          | 30 min         | 4 h             |
| P2       | 30 min          | 2 h            | 1 business day  |
| P3       | 1 business day  | Daily          | 5 business days |
| P4       | 2 business days | Weekly         | Backlog         |

## Internal OLAs (examples)

| From → To                | Obligation                                                        |
| ------------------------ | ----------------------------------------------------------------- |
| L1 → L2                  | Escalate with correlation ID + repro within 30 min of stuck P1/P2 |
| Service Owner → Ops Lead | Health red → status within 15 min                                 |
| Release Manager → Ops    | Deploy window notice ≥ 24 h (Normal change)                       |

## Operational KPIs

| KPI                          | Intent                           |
| ---------------------------- | -------------------------------- |
| MTTA / MTTR by severity      | Response effectiveness           |
| Change success rate          | Stability                        |
| Failed change rollbacks      | Risk control                     |
| Backup restore test currency | Resilience                       |
| Open P1/P2 count             | Hotspot detection                |
| KL-related ticket ratio      | Honesty / expectation management |

## Explicit non-SLA

Workflow execute · Email/SMS/push delivery · Support realtime WS/SSE · uncertified AI.
