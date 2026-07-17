# APZHUB Observability Administration Workbench Architecture

**Milestone:** APZOBSERVE-004  
**Status:** Complete  
**Route:** `/workspace/observability`  
**Capability:** `platform-observability`

## Purpose

Product-neutral Observability **metadata governance** Workbench. It is an administration surface over the Observability Typed Client — not a Grafana replacement, Prometheus query UI, log viewer, trace explorer, or incident-response engine.

## Architecture

```text
Observability Administration Workbench
  → apps/web/lib/observe (typed client + observe-api + observeQueryKeys)
  → /api/v1/observe/*
  → gateway.observe.*
  → RequestPipeline → Production Authorization
  → Observability Platform Services → Core → Persistence → PostgreSQL
```

## Boundary

The Workbench imports only:

- `@/lib/observe` / `observe-api` / `query-keys` / `observe-errors` / `routes`
- approved UI packages (`@apzhub/ui`, TanStack Query)

It must **not** import gateway, platform-services, observe-core, observe-persistence, databases, provider SDKs, or call ad hoc `fetch` from components.

## Registration

Manifest-driven under `packages/workbench-framework/manifests/platform-observability*`:

- Activity Bar: Platform Observability (`observe.read`, icon `activity`, order 54)
- Sidebar: Overview + all 19 metadata facets + Diagnostics + Metadata
- Mounted via catch-all workspace + `ObserveWorkspaceRouter` in `workbench-page.tsx`
- **No** `apps/web/app/workspace/observability/` tree

Platform Administration, Identity Administration, Platform Operations, and Platform Observability remain separate capabilities.

## Capability notices

Non-blocking banners always communicate that live metrics/logs/traces, Grafana/Prometheus/Loki/OpenTelemetry/AlertManager, alert delivery, and incident execution are unavailable.

## Audit

`pnpm audit:observe-workbench` — zero violations required.

## Next milestone

**APZOBSERVE-005 — Observability Vertical Certification & Production Readiness** (not started; await owner approval).

## See also

- [Observability Workbench Navigation Guide](../guides/APZHUB-Observability-Workbench-Navigation-Guide.md)
- [Observability Views Catalogue](../guides/APZHUB-Observability-Views-Catalogue.md)
- [APZOBSERVE-004 Completion Report](../sprint/APZOBSERVE-004-completion-report.md)
