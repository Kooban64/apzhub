# APZ Analytics — System of Record

| Field     | Value             |
| --------- | ----------------- |
| Programme | APZ-ANALYTICS-000 |
| Status    | **APPROVED**      |
| Timestamp | 20260805T174500Z  |

## Law

> **Analytics consumes Systems of Record. It never becomes one.**

## What Analytics may hold

| Allowed (derived)                                       | Forbidden (authoritative)                                          |
| ------------------------------------------------------- | ------------------------------------------------------------------ |
| Derived aggregates, trends, KPI snapshots for insight   | Authoritative project / ticket / time / document / process records |
| Cached observations with clear non-authoritative status | Duplicate business truth “for convenience”                         |
| Question → observation mappings                         | New SoR for “analytics facts”                                      |

## Authority map

| Datum                         | System of Record  | Analytics role     |
| ----------------------------- | ----------------- | ------------------ |
| Project / delivery work       | APZ Projects      | Observe            |
| Service / support work        | APZ Support       | Observe            |
| Time / effort                 | APZ Time          | Observe            |
| Documents                     | APZ Documents     | Observe            |
| Business processes / journeys | APZ Workflow      | Observe            |
| Quality / release evidence    | APZQEP            | Observe            |
| Interpretation of performance | **APZ Analytics** | Own (insight only) |

If a conflict arises between Analytics and a SoR, the **SoR wins**.
