# LAW-OPERATIONS-DASHBOARD

| Field     | Value                                                       |
| --------- | ----------------------------------------------------------- |
| Programme | APZHUB-LAW-ADOPT-004                                        |
| Timestamp | 20260803T135126Z                                            |
| Mode      | **Structure only** — no live tooling, no fabricated metrics |

## Purpose

Define the executive/ops dashboard layout for Law under the same model as APZQEP Product Health Dashboard. Implementation of dashboard software is **out of scope**.

## Platform & security rows

| Metric                       | Source (when available) | Current value                             |
| ---------------------------- | ----------------------- | ----------------------------------------- |
| Availability (%)             | Uptime / health probes  | Defined – Awaiting Production Measurement |
| Error rates                  | Gateway / Law API logs  | Defined – Awaiting Production Measurement |
| Performance (p50/p95)        | APM / logs              | Defined – Awaiting Production Measurement |
| Authentication failures      | Auth logs               | Defined – Awaiting Production Measurement |
| Authorisation denials        | Permission / API 403    | Defined – Awaiting Production Measurement |
| Background processing health | Workers / jobs          | Defined – Awaiting Production Measurement |
| Audit event health           | Audit store / logs      | Defined – Awaiting Production Measurement |
| Security events              | Security / audit        | Defined – Awaiting Production Measurement |
| Operational alerts (open)    | Alert manager           | Defined – Awaiting Production Measurement |

## Product activity rows

| Metric                    | Source (when available) | Current value                             |
| ------------------------- | ----------------------- | ----------------------------------------- |
| Active Law users          | Session / audit         | Defined – Awaiting Production Measurement |
| Client / Matter activity  | Law API / SoR           | Defined – Awaiting Production Measurement |
| Trust accounting activity | Trust routes / audit    | Defined – Awaiting Production Measurement |
| Search activity           | Law search / Knowledge  | Defined – Awaiting Production Measurement |

## Alert model (structure)

| Alert class      | Example trigger      | Response                     |
| ---------------- | -------------------- | ---------------------------- |
| Availability     | Health facet fail    | Incident process S1/S2       |
| Error spike      | Error rate threshold | Incident + problem candidate |
| Auth anomaly     | Auth failure spike   | Security path                |
| Perf degradation | p95 breach           | Ops mitigate / capacity note |

Threshold numbers are **not** set here without measured baselines.

## Validation

Dashboard **structure** complete. Live dashboards / tooling **not** built (explicit exclusion).
