# APZ Knowledge — Operational Metrics

| Field     | Value            |
| --------- | ---------------- |
| Status    | **IN FORCE**     |
| Timestamp | 20260806T092000Z |

## Principle

Measure **behaviour**, not features. Do **not** build wiki/search/AI surfaces in ops metrics work.

## Minimum metrics

| Metric                           | Definition                                                  | Capture            |
| -------------------------------- | ----------------------------------------------------------- | ------------------ |
| Quality Flows opened             | Count of Flows for APZ Knowledge changes                    | Per Flow           |
| Decision Packages generated      | Count of Decision Packages                                  | Per Flow / release |
| Evidence completeness            | % of closed Flows with complete evidence                    | Weekly / monthly   |
| Release duration                 | Flow open → Closed                                          | Per release        |
| Engineering friction count       | Friction Log entries (Engineering)                          | Per period         |
| Operational learning count       | Learning Register entries                                   | Per period         |
| Release confidence               | High / Medium / Low                                         | Per release        |
| Manual interventions             | Steps outside APZQEP tooling                                | Per Flow           |
| Wiki/search identity regressions | Incidents of document-library or search-portal framing      | Per period         |
| Vocabulary integrity incidents   | Knowledge confused with Discovery / Learning / AI           | Per period         |
| Admin-surface leakage            | Diagnostics/admin defining primary identity                 | Per period         |
| Context delivery effectiveness   | Qualitative: memory used to act correctly (when observable) | Per period         |

## Tally sheet

```text
Period:
Quality Flows opened:
Decision Packages generated:
Evidence completeness (%):
Releases shipped:
Release confidence:
Friction entries:
Learning entries:
Wiki/search regressions:
Vocabulary incidents:
Admin leakage:
```
