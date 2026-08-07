# APZ Analytics — Operational Metrics

| Field     | Value            |
| --------- | ---------------- |
| Status    | **IN FORCE**     |
| Timestamp | 20260805T184500Z |

## Principle

Measure **behaviour**, not features. Do **not** build dashboards or new insight surfaces in this slice.

## Minimum metrics

| Metric                      | Definition                                                     | Capture            |
| --------------------------- | -------------------------------------------------------------- | ------------------ |
| Quality Flows opened        | Count of Flows opened for APZ Analytics changes                | Per Flow           |
| Decision Packages generated | Count of Decision Packages produced                            | Per Flow / release |
| Evidence completeness       | % of closed Flows with complete evidence pack                  | Weekly / monthly   |
| Release duration            | Wall-clock from Flow open → Closed (shipping releases)         | Per release        |
| Engineering friction count  | Entries tagged Engineering in Friction Log                     | Per period         |
| Operational learning count  | Learning Register entries for APZ Analytics                    | Per period         |
| Release confidence          | Qualitative High / Medium / Low at release gate                | Per release        |
| Manual interventions        | Count of steps performed outside APZQEP tooling                | Per Flow           |
| Dashboard-first regressions | Incidents of dashboard/report language as product identity     | Per period         |
| Admin-surface leakage       | Incidents of admin reporting defining primary product identity | Per period         |

## Tally sheet

```text
Period:
Quality Flows opened:
Decision Packages generated:
Evidence completeness (%):
Releases shipped:
Avg release duration:
Engineering friction count:
Operational learning count:
Dashboard-first regressions:
Admin-surface leakage:
Release confidence (list):
Manual interventions:
Notes / patterns:
```
