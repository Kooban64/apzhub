# APZ Law — Operational Metrics

| Field     | Value            |
| --------- | ---------------- |
| Status    | **IN FORCE**     |
| Timestamp | 20260805T201500Z |

## Principle

Measure **behaviour**, not features. Do **not** build practice or legal-SaaS surfaces in this slice.

## Minimum metrics

| Metric                         | Definition                                                      | Capture            |
| ------------------------------ | --------------------------------------------------------------- | ------------------ |
| Quality Flows opened           | Count of Flows opened for APZ Law changes                       | Per Flow           |
| Decision Packages generated    | Count of Decision Packages produced                             | Per Flow / release |
| Evidence completeness          | % of closed Flows with complete evidence pack                   | Weekly / monthly   |
| Release duration               | Wall-clock from Flow open → Closed (shipping releases)          | Per release        |
| Engineering friction count     | Entries tagged Engineering in Friction Log                      | Per period         |
| Operational learning count     | Learning Register entries for APZ Law                           | Per period         |
| Release confidence             | Qualitative High / Medium / Low at release gate                 | Per release        |
| Manual interventions           | Count of steps performed outside APZQEP tooling                 | Per Flow           |
| Practice-first regressions     | Incidents of matters/trust/billing as product identity          | Per period         |
| Legal-advice framing incidents | Incidents of product presenting as counsel / advice             | Per period         |
| Admin-surface leakage          | Incidents of practice tooling defining primary product identity | Per period         |

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
Practice-first regressions:
Legal-advice framing incidents:
Admin-surface leakage:
Release confidence (list):
Manual interventions:
Notes / patterns:
```
