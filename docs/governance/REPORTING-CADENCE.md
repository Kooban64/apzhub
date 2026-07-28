# APZOR Reporting Cadence and KPI Governance

> **Programme:** APZHUB-GOVERNANCE-001  
> **Date:** 2026-07-20  
> **Related:** [GOVERNANCE-KPI-CATALOGUE.md](./GOVERNANCE-KPI-CATALOGUE.md) · [SERVICE-LEVELS.md](../operations/SERVICE-LEVELS.md)

---

## Reporting cadence

| Report                  | Cadence     | Audience               | Contents                        |
| ----------------------- | ----------- | ---------------------- | ------------------------------- |
| Incident summary        | Weekly      | ORB                    | P1–P3 counts, MTTA/MTTR         |
| Change success          | Weekly      | CAB                    | Success/rollback rate           |
| Platform health         | Weekly      | Ops / Platform Owner   | Tier A/B signals                |
| Risk digest             | Monthly     | Risk Committee / Owner | Top risks, treatments           |
| Portfolio SemVer        | Monthly     | Executive              | Register drift, open programmes |
| Security access review  | Quarterly   | Security Committee     | Superadmin, privileges          |
| Backup restore evidence | Quarterly   | ORB / Risk             | Drill results                   |
| Baseline honesty        | Per release | Owner                  | KL vs marketing                 |

## KPI governance

1. KPIs must map to catalogue services or programmes — no vanity metrics.
2. Executive dashboards (when implemented) summarise repository evidence — [ENGINEERING-GOVERNANCE-DASHBOARD.md](./ENGINEERING-GOVERNANCE-DASHBOARD.md).
3. This programme does **not** implement dashboards.

## Executive dashboard (governance target)

Status of: Production Baseline · open P1/P2 · freeze exceptions · open Owner Approvals · top risks · KL disclosure health.
