# APZHUB Platform Observability Operational Readiness Guide

**Programme:** Platform Observability (APZOBSERVE)  
**Status:** Final for wave freeze (APZOBSERVE-006)  
**Classification:** PRODUCTION_READY_WITH_LIMITATIONS  
**Related:** [APZOBSERVE-005 Operational Readiness](../reviews/APZOBSERVE-005-Operational-Readiness.md)

---

## Scope

Operational expectations for the **metadata governance** plane.  
**LIVE TELEMETRY PROVIDERS ARE NOT MANAGED** by Platform Observability. Collection, ingestion, alert delivery, and incident execution are unavailable.

## Environment configuration

| Variable | Requirement |
| --- | --- |
| `APZHUB_OBSERVE_ENABLED` | Deny-by-default; set `true` / `1` / `on` to enable |
| PostgreSQL | Required in production for Observability SoR |
| Platform migrations | Apply `0054_apz_platform_observe.sql` then `0055_apz_platform_observe_rls.sql` before enable |

## Deployment prerequisites

1. Platform PostgreSQL available
2. Migrations `0054` → `0055` applied
3. Platform services with Observability wiring (`gateway.observe.*`)
4. Web application (HTTP handlers + Workbench manifests)
5. Operators granted `observe.read` (and granular `observe.*` as needed)

## Deployment order

1. Apply PostgreSQL migrations `0054` → `0055`
2. Deploy platform services with Observability wiring
3. Deploy web application (HTTP handlers + Workbench)
4. Set `APZHUB_OBSERVE_ENABLED=true`
5. Verify `/api/v1/observe/health` and `/api/v1/observe/readiness`
6. Verify Workbench `/workspace/observability` Overview and Diagnostics

## Controlled disable procedure

1. Set `APZHUB_OBSERVE_ENABLED=false` (or unset)
2. Expect HTTP `503` with code `OBSERVE_SERVICE_UNAVAILABLE`
3. Expect Workbench controlled unavailable state
4. Confirm no in-memory production fallback occurs

## Backup and restore

- Include `platform_observe_*` tables in platform PostgreSQL backup sets
- Restore with platform DB restore procedures; re-validate RLS / tenant scoping after restore
- Do not drop Observability tables without explicit owner approval

## Diagnostics usage

- Health / readiness / capabilities / management diagnostics
- Provider execution always unavailable — do not treat Diagnostics as provider connectivity tests
- Authorization denials and persistence failures via structured logs + correlation IDs

## Operational monitoring expectations

- Monitor API availability of `/api/v1/observe/health` and readiness
- Monitor authorization denial rates and persistence errors
- Do **not** expect Grafana/Prometheus/Loki/OTel/AlertManager probes from this plane

## Maintenance procedures

- Metadata CRUD via Workbench or HTTP under production authz
- Maintenance windows are metadata only — they do not auto-suppress alerts
- Schema changes require ADR + owner approval (architecture frozen)

## Rollback guidance

1. Disable via `APZHUB_OBSERVE_ENABLED=false` for immediate service isolation
2. Application rollback follows normal platform deploy rollback
3. Database rollback of `0054`/`0055` is not routine — requires owner approval and migration review

## Production limitations

- No live telemetry providers
- No collection / ingestion / streaming
- No alert evaluation or delivery
- No incident-response execution
- Playwright live webServer may remain LIMITED (external Testing slug conflict)

## Operational ownership

| Area | Owner |
| --- | --- |
| Observability metadata SoR | Platform Observability |
| Live telemetry providers | Future programmes (roadmap only) |
| Platform Operations console | Separate product (`/workspace/operations`) |
| Administration / Identity | Frozen separate SoRs |

## See also

- [Architecture Freeze Notice](../architecture/APZHUB-Observability-Architecture-Freeze-Notice.md)
- [Observability Reference Standard](../architecture/APZHUB-Observability-Reference-Standard.md)
