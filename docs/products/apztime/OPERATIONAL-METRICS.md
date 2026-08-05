# APZ Time — Operational Metrics

| Field     | Value            |
| --------- | ---------------- |
| Status    | **IN FORCE**     |
| Timestamp | 20260805T034500Z |

## Principle

Measure **behaviour**, not features.  
Do **not** build dashboards in this slice — document and tally manually / in evidence packs.

## Minimum metrics

| Metric                      | Definition                                             | Capture            |
| --------------------------- | ------------------------------------------------------ | ------------------ |
| Quality Flows opened        | Count of Flows opened for APZ Time changes             | Per Flow           |
| Decision Packages generated | Count of Decision Packages produced                    | Per Flow / release |
| Evidence completeness       | % of closed Flows with complete evidence pack          | Weekly / monthly   |
| Release duration            | Wall-clock from Flow open → Closed (shipping releases) | Per release        |
| Engineering friction count  | Entries tagged Engineering in Friction Log             | Per period         |
| Operational learning count  | Learning Register entries for APZ Time                 | Per period         |
| Release confidence          | Qualitative High / Medium / Low at release gate        | Per release        |
| Manual interventions        | Count of steps performed outside APZQEP tooling        | Per Flow           |

## Tally sheet (copy into monthly review)

```text
Period:
Quality Flows opened:
Decision Packages generated:
Evidence completeness (%):
Releases shipped:
Avg release duration:
Engineering friction count:
Operational learning count:
Release confidence (list):
Manual interventions:

Notes / patterns:
```

## Interpretation

| Signal                       | Meaning                                                              |
| ---------------------------- | -------------------------------------------------------------------- |
| High manual interventions    | Process or tooling gap — record learning; do not redesign APZQEP yet |
| Low evidence completeness    | Discipline failure — Engineering Manager ownership                   |
| Long release duration        | Friction — capture timings; pattern before backlog                   |
| Zero learning after releases | Process incomplete — Learning is mandatory                           |
