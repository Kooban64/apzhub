# APZHUB Administration Operational Readiness Guide

**Programme:** APZADMIN (metadata governance plane)  
**Wave:** APZADMIN-006  
**Classification:** PRODUCTION_READY_WITH_LIMITATIONS

---

## Production deployment expectations

- Enable Administration via `APZHUB_ADMINISTRATION_ENABLED` only when PostgreSQL-backed persistence, production authorisation, RequestPipeline, and Administration Platform Services are wired
- Do not silently fall back to in-memory persistence or allow-all authorisation in production
- Serve HTTP under `/api/v1/administration` through the existing Next.js App Router / API Gateway path
- Expose Workbench at `/workspace/administration` via `platform-admin` manifest discovery
- Keep Platform Operations at `/workspace/operations` — do not merge products

## Supported topology

```text
Clients / Workbench
→ Typed Client
→ /api/v1/administration
→ PlatformServiceGateway.administration.*
→ RequestPipeline + Production Authorization
→ Administration Platform Services → Core → Persistence → PostgreSQL
```

Single SoR for administration **metadata**. No distributed runtime admin control plane in this wave.

## Operational boundaries (by design)

| Capability                       | Status                                      |
| -------------------------------- | ------------------------------------------- |
| Runtime administration           | **RUNTIME ADMINISTRATION IS NOT AVAILABLE** |
| User / role management           | Not available                               |
| Tenant / organisation management | Not available                               |
| Provisioning                     | Not available                               |
| Live infrastructure diagnostics  | Not available                               |
| Event Bus / AI administration    | Not available                               |
| Product ownership                | Not available — metadata coordination only  |

## Monitoring expectations

- Health / readiness / management-capabilities endpoints under `/api/v1/administration`
- Correlate via platform correlation IDs
- Treat deliberate “unavailable” capability banners as design, not incidents

## Backup expectations

- Back up platform PostgreSQL including `platform_admin_*` tables
- Administration metadata is platform-owned; product SoRs remain in their own stores

## Upgrade expectations

- Frozen package surface: contracts/core **0.2.0**, persistence **0.1.0**, OpenAPI **1.6.0**
- Behavioural or architectural changes require ADR + owner approval + new milestone
- Re-run `pnpm audit:administration-wave` after governed changes

## Governance responsibilities

- Administration registers and presents capability metadata
- Product owners remain accountable for their SoRs and Workbenches
- Platform Operations remains the separate ops console product
