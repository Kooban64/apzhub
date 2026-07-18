# APZHUB Metrics Validation Guide

**Milestone:** APZMETRICS-001  
**Implementation:** `@apzhub/metrics-core` → `validation/validate-metrics.ts`

## Validators

| Function                        | Checks                                                      |
| ------------------------------- | ----------------------------------------------------------- |
| `validateMetric`                | id shape, tenant, key, name, lifecycle, credential metadata |
| `validateMetricDefinition`      | metricId, key, name, kind, versionNumber ≥ 1, status        |
| `validateKPI`                   | key, name, metricId, status                                 |
| `validateMetricDependency`      | both ids, no self-dep, dependencyKind, status               |
| `validateMetricFormula`         | expression present, language enum — **does not evaluate**   |
| `validateMetricThreshold`       | operator, severity, valueLabel — **does not evaluate**      |
| `validateMetricRetentionPolicy` | retentionDays ≥ 0                                           |
| `assertNoCredentialPayload`     | rejects password/secret/token/apikey/credential keys        |

Domain service adds: unique metric keys, immutable keys on update, existence checks for KPI/dependency/formula metric refs.
