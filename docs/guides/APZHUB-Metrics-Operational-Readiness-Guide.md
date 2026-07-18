# APZHUB Platform Metrics Operational Readiness Guide

**Date:** 2026-07-18  
**Programme:** APZMETRICS (wave frozen at APZMETRICS-006)  
**Classification:** PRODUCTION_READY_WITH_LIMITATIONS  
**Applies to:** Certified metadata governance plane only

---

## Deployment expectations

1. Deploy platform PostgreSQL with Metrics migrations applied
2. Deploy `apps/web` with Metrics HTTP routes and Workbench manifests
3. Configure IAM permissions before enabling the service
4. Enable Metrics only after readiness checks pass

## Production configuration

| Item                     | Expectation                                                   |
| ------------------------ | ------------------------------------------------------------- |
| `APZHUB_METRICS_ENABLED` | `true` / `1` / `on` to enable; **deny-by-default** when unset |
| Platform database        | Required — production factory requires `postgresDb`           |
| OpenAPI                  | Platform **1.9.0** — tag **Platform Metrics Administration**  |
| Workbench                | `/workspace/metrics` · permission `metrics.read`              |

## PostgreSQL requirements

- Migration `0056_apz_platform_metrics.sql` — `platform_metrics_*` tables
- Migration `0057_apz_platform_metrics_rls.sql` — RLS
- No secret columns in Metrics schema
- In-memory persistence is test-only — forbidden in production

## Bootstrap configuration

`isMetricsServiceEnabled` reads `APZHUB_METRICS_ENABLED`. When disabled:

- Gateway throws not-enabled
- HTTP returns `503 METRICS_SERVICE_UNAVAILABLE`
- Workbench shows unavailable state

## Diagnostics

| Endpoint                                       | Purpose                            |
| ---------------------------------------------- | ---------------------------------- |
| `GET /api/v1/metrics/diagnostics/health`       | Safe health metadata               |
| `GET /api/v1/metrics/diagnostics/readiness`    | Persistence/registration readiness |
| `GET /api/v1/metrics/diagnostics/capabilities` | Facet catalogue + execution flags  |

Expect `formulaExecutionEnabled` / `kpiExecutionEnabled` / `providerIntegrationEnabled` = **false**.

## Monitoring expectations

- Platform health hierarchy includes Metrics service/connector readiness via platform diagnostics
- Alert on sustained `METRICS_SERVICE_UNAVAILABLE` when Metrics is intended enabled
- Do not monitor for live KPI values or scrape success — those planes are not managed here

## Operational limitations

- Metadata only — formula execution and KPI execution are **not managed**
- No Prometheus / Grafana / OpenTelemetry integrations
- No analytics / reporting / dashboards
- No Event Bus / AI
- Playwright live webServer may be LIMITED by external Testing slug conflict (certification residual)

## Support expectations

- Support Workbench metadata CRUD issues, authz denials, and disable/enable behaviour
- Escalate architecture changes through ADR + owner approval (architecture is **frozen**)
- Do not promise calculation, provider, or dashboard behaviour from this SoR

## Upgrade guidance

1. Retain package versions unless a new approved milestone advances them
2. Re-run `pnpm audit:metrics-wave` after documentation-only governance updates
3. Re-run `pnpm certify:metrics-vertical` before any approved behavioural change milestone
4. Apply new migrations only via approved milestones

## Disable procedure

Set `APZHUB_METRICS_ENABLED=false` (or unset). Clients receive `METRICS_SERVICE_UNAVAILABLE`.

## See also

- [Architecture Freeze Notice](../architecture/APZHUB-Metrics-Architecture-Freeze-Notice.md)
- [Reference Standard](../architecture/APZHUB-Metrics-Reference-Standard.md)
- [Bootstrap Guide](./APZHUB-Metrics-Bootstrap-Guide.md)
