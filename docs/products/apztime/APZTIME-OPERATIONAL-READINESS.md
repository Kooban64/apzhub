# APZ Time — Operational Readiness

| Field     | Value            |
| --------- | ---------------- |
| Status    | **IN FORCE**     |
| Timestamp | 20260805T034500Z |

## Purpose

Operating guidance only. No new product functionality.

## Daily operations

| Activity                              | Owner                       | Notes                                      |
| ------------------------------------- | --------------------------- | ------------------------------------------ |
| Use APZ Time as product               | All users                   | Single APZHUB identity                     |
| Triage defects / requests             | Product Owner / Engineering | Classify; reject unauthorised scope        |
| Open Quality Flows for in-flight work | Developer                   | No silent changes                          |
| Monitor health (admin)                | Operations                  | Platform readiness / Health — `time.admin` |

## Weekly review

| Check      | Question                                            |
| ---------- | --------------------------------------------------- |
| Open Flows | Any APZ Time Quality Flow stalled?                  |
| Evidence   | Incomplete packs for closed work?                   |
| Friction   | New FRICTION-LOG entries this week?                 |
| Learning   | Any Learning Register promotions needed?            |
| Leakage    | Any engine/adapter terminology in product or notes? |

## Monthly health review

| Area              | Review                                                 |
| ----------------- | ------------------------------------------------------ |
| Metrics           | See [OPERATIONAL-METRICS.md](./OPERATIONAL-METRICS.md) |
| Standards fitness | Is Native Adoption / APZQEP too heavy or too thin?     |
| Deferrals         | Still correct to defer Phase B/C items?                |
| Adapter           | Cert status unchanged; no user-visible engine exposure |

## Operational reporting

Report facts only:

- Flows opened / closed
- Releases shipped
- Evidence completeness
- Friction / learning counts
- Manual interventions

Do **not** build dashboards in this slice.

## Continuous improvement

1. Record observation (Friction / Learning).
2. Detect patterns across releases.
3. Promote candidates to ADOPT-001 Improvement Backlog.
4. Implement only under separate Owner Authorisation.

Observation ≠ authorisation to change APZQEP or Time features.
