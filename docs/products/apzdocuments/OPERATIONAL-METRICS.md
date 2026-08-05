# APZ Documents — Operational Metrics

| Field     | Value            |
| --------- | ---------------- |
| Status    | **IN FORCE**     |
| Timestamp | 20260805T151500Z |

## Principle

Measure **behaviour**, not features. Do **not** build dashboards in this slice.

## Minimum metrics

| Metric                      | Definition                                             | Capture            |
| --------------------------- | ------------------------------------------------------ | ------------------ |
| Quality Flows opened        | Count of Flows opened for APZ Documents changes        | Per Flow           |
| Decision Packages generated | Count of Decision Packages produced                    | Per Flow / release |
| Evidence completeness       | % of closed Flows with complete evidence pack          | Weekly / monthly   |
| Release duration            | Wall-clock from Flow open → Closed (shipping releases) | Per release        |
| Engineering friction count  | Entries tagged Engineering in Friction Log             | Per period         |
| Operational learning count  | Learning Register entries for APZ Documents            | Per period         |
| Release confidence          | Qualitative High / Medium / Low at release gate        | Per release        |
| Manual interventions        | Count of steps performed outside APZQEP tooling        | Per Flow           |
| Work-companion regressions  | Incidents of repository-first UX reintroduced          | Per period         |

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
Work-companion regressions:
Release confidence (list):
Manual interventions:
Notes / patterns:
```
