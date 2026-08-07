# APZ Workflow — Operational Metrics

| Field     | Value            |
| --------- | ---------------- |
| Status    | **IN FORCE**     |
| Timestamp | 20260805T171000Z |

## Principle

Measure **behaviour**, not features. Do **not** build dashboards in this slice.

## Minimum metrics

| Metric                           | Definition                                                    | Capture            |
| -------------------------------- | ------------------------------------------------------------- | ------------------ |
| Quality Flows opened             | Count of Flows opened for APZ Workflow changes                | Per Flow           |
| Decision Packages generated      | Count of Decision Packages produced                           | Per Flow / release |
| Evidence completeness            | % of closed Flows with complete evidence pack                 | Weekly / monthly   |
| Release duration                 | Wall-clock from Flow open → Closed (shipping releases)        | Per release        |
| Engineering friction count       | Entries tagged Engineering in Friction Log                    | Per period         |
| Operational learning count       | Learning Register entries for APZ Workflow                    | Per period         |
| Release confidence               | Qualitative High / Medium / Low at release gate               | Per release        |
| Manual interventions             | Count of steps performed outside APZQEP tooling               | Per Flow           |
| Execution-vocabulary regressions | Incidents of Run/Engine/Provider language in standard UX      | Per period         |
| Operator-surface leakage         | Incidents of operator tools defining primary product identity | Per period         |

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
Execution-vocabulary regressions:
Operator-surface leakage:
Release confidence (list):
Manual interventions:
Notes / patterns:
```
