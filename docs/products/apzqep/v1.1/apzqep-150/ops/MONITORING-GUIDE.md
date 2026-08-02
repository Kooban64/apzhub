# APZQEP Monitoring Guide

Primary: platform monitoring (`docs/operations/MONITORING-AND-ALERTING.md`).

| Signal             | Source                              |
| ------------------ | ----------------------------------- |
| Liveness/readiness | `GET /api/health`                   |
| App logs           | structured platform logs            |
| Infra              | Prometheus/Grafana per platform ops |

Gap (MR-003): Cap A–F facets not yet on `/api/health`. Monitor workspace errors and API 5xx rates as proxy.
