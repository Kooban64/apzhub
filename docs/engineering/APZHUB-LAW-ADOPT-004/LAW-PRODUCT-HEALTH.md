# LAW-PRODUCT-HEALTH

| Field     | Value                                          |
| --------- | ---------------------------------------------- |
| Programme | APZHUB-LAW-ADOPT-004                           |
| Timestamp | 20260803T135126Z                               |
| Mode      | Measurement framework — **no invented values** |

## Rules

1. Populate only from measurable production / platform sources.
2. Until observed, record **Defined – Awaiting Production Measurement**.
3. Do not estimate or fabricate trends.
4. Update: Daily ops review (platform/ops metrics); Weekly health review (product signals).

## Operational KPIs (defined)

| KPI                     | Intent                                   | Status                                     |
| ----------------------- | ---------------------------------------- | ------------------------------------------ |
| Availability            | Service reachable / health facets green  | Defined – Awaiting Production Measurement  |
| Error rate              | 5xx / failed Law API envelope rate       | Defined – Awaiting Production Measurement  |
| Performance             | Law API latency p50 / p95                | Defined – Awaiting Production Measurement  |
| Authentication          | Auth failure rate                        | Defined – Awaiting Production Measurement  |
| Authorisation           | Permission denial rate (Law permissions) | Defined – Awaiting Production Measurement  |
| Background processing   | Job/worker failures (if enabled)         | Defined – Awaiting Production Measurement  |
| Audit events            | Audit write/read health                  | Defined – Awaiting Production Measurement  |
| Security events         | Security/anomaly signals                 | Defined – Awaiting Production Measurement  |
| Open operational alerts | Alert backlog                            | Defined – Awaiting Production Measurement  |
| Open S1/S2 incidents    | Incident register                        | Defined – register empty at programme open |
| Accepted residuals      | Known issues                             | See LAW-KNOWN-ISSUES                       |

## Governance signals

| Signal                       | State                                         |
| ---------------------------- | --------------------------------------------- |
| Engineering authority        | **CLOSED**                                    |
| Ops programme                | **APZHUB-LAW-ADOPT-004** (this pack)          |
| Enterprise adoption complete | **Not claimed**                               |
| Next Board gate              | PBR-APZHUB-LAW-004 (Operations Certification) |

## Validation

Structure validated under ADOPT-004. Live values require production observation after operational measurement windows — **not** performed here.
