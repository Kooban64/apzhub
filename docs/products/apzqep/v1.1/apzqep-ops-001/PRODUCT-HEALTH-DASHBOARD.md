# PRODUCT-HEALTH-DASHBOARD — Executive Operational View

| Field     | Value                                          |
| --------- | ---------------------------------------------- |
| Programme | APZQEP-OPS-001                                 |
| Timestamp | 20260803T072224Z                               |
| Mode      | Measurement framework — **no invented values** |

## Rules

1. Populate cells only from measurable production / platform sources.
2. Until a metric is observed, record **NOT YET MEASURED**.
3. Do not estimate or fabricate trends.
4. Update cadence: Daily Operational Review (operational metrics); Weekly Product Health Review (product metrics).

## Platform & infrastructure

| Metric                    | Source                           | Current value    | As-of |
| ------------------------- | -------------------------------- | ---------------- | ----- |
| System availability (%)   | Uptime / health probes           | NOT YET MEASURED | —     |
| API latency p50 / p95     | Gateway / APM / logs             | NOT YET MEASURED | —     |
| Workspace responsiveness  | Client RUM / synthetic           | NOT YET MEASURED | —     |
| Database health           | Postgres metrics / `/api/health` | NOT YET MEASURED | —     |
| Queue health              | Outbox / worker metrics          | NOT YET MEASURED | —     |
| Notification health       | Notification delivery metrics    | NOT YET MEASURED | —     |
| Processing health         | Platform processing workers      | NOT YET MEASURED | —     |
| Search health             | Search provider metrics          | NOT YET MEASURED | —     |
| Error rates               | Gateway / app logs               | NOT YET MEASURED | —     |
| Authentication failures   | Auth logs                        | NOT YET MEASURED | —     |
| Security events           | Audit / security logs            | NOT YET MEASURED | —     |
| Operational alerts (open) | Alert manager                    | NOT YET MEASURED | —     |

## Product activity

| Metric                       | Source              | Current value    | As-of |
| ---------------------------- | ------------------- | ---------------- | ----- |
| User activity (active users) | Session / audit     | NOT YET MEASURED | —     |
| Active projects              | Cap / platform data | NOT YET MEASURED | —     |
| Execution statistics         | Cap C               | NOT YET MEASURED | —     |
| Defect statistics            | Cap D               | NOT YET MEASURED | —     |
| Requirement coverage         | Cap E               | NOT YET MEASURED | —     |
| Suite usage                  | Cap A               | NOT YET MEASURED | —     |
| Planning activity            | Cap B               | NOT YET MEASURED | —     |
| Reporting usage              | Cap F               | NOT YET MEASURED | —     |

## Governance signals

| Signal                | State                                                      |
| --------------------- | ---------------------------------------------------------- |
| Engineering authority | CLOSED                                                     |
| Version 1.1           | NOT OPENED                                                 |
| Open P1/P2 incidents  | See incident register (empty at programme open)            |
| Accepted residuals    | See [KNOWN-ISSUES-REGISTER.md](./KNOWN-ISSUES-REGISTER.md) |

## Validation

Dashboard structure validated under APZQEP-OPS-001. Live values require production observation windows after deployment under operational procedures.
