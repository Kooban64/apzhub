# APZ Projects — Operational Readiness

| Field     | Value            |
| --------- | ---------------- |
| Status    | **IN FORCE**     |
| Timestamp | 20260805T074000Z |

## Purpose

Operating guidance only. No new product functionality.

## Daily operations

| Activity                              | Owner                       | Notes                               |
| ------------------------------------- | --------------------------- | ----------------------------------- |
| Use APZ Projects as product           | All users                   | Single APZHUB identity              |
| Triage defects / requests             | Product Owner / Engineering | Classify; reject unauthorised scope |
| Open Quality Flows for in-flight work | Developer                   | No silent changes                   |
| Production care                       | Operations                  | Health signals; incidents           |

## Weekly review

| Check      | Question                                            |
| ---------- | --------------------------------------------------- |
| Open Flows | Any APZ Projects Quality Flow stalled?              |
| Evidence   | Incomplete packs for closed work?                   |
| Friction   | New FRICTION-LOG entries this week?                 |
| Learning   | Any Learning Register / EPP promotions needed?      |
| Leakage    | Any engine/adapter terminology in product or notes? |

## Monthly health review

| Area              | Review                                                 |
| ----------------- | ------------------------------------------------------ |
| Metrics           | See [OPERATIONAL-METRICS.md](./OPERATIONAL-METRICS.md) |
| Standards fitness | Is Native Adoption / APZQEP too heavy or too thin?     |
| Deferrals         | Still correct to defer later capability items?         |
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

1. Record observation (Friction / Learning / Emerging Portfolio Pattern).
2. Detect patterns across releases and products.
3. Promote candidates only when evidence justifies it.
4. Implement only under separate Owner Authorisation.

Observation ≠ authorisation to change APZQEP or Projects features.
