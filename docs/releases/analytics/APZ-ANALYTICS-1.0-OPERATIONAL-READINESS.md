# APZ Analytics 1.0.0 — Operational Readiness

> **Programme:** APZ-ANALYTICS-002  
> **Date:** 2026-07-19

---

## Enablement

| Control      | Requirement                                                                      |
| ------------ | -------------------------------------------------------------------------------- |
| Feature flag | `APZHUB_ANALYTICS_ENABLED=true`                                                  |
| Provider     | Metabase env configured **or** non-prod `APZHUB_ANALYTICS_DOMAIN_MODE=in_memory` |
| Auth         | Better Auth session + Analytics permissions                                      |
| Gateway      | Standard platform API pipeline (auth → authz → service → connector)              |

## Health & diagnostics

- HTTP readiness/capabilities under `/api/v1/analytics/*`
- Workbench Health + Diagnostics views (engine branding masked)
- Metabase adapter health/diagnostics (CERTIFIED_FOUNDATION)

## Operations notes

1. Prefer Metabase CE self-hosted for production provider path.
2. In-memory registry is not an authoritative SoR — suitable for local/demo only.
3. No live embed token issuance in Release 1.0 — detail views are metadata.
4. Correlate requests via platform correlation IDs (010).
5. Do not expose Metabase admin UI as the primary user surface.

## Related

- [Metabase OPERATIONAL-READINESS](../../integrations/metabase/OPERATIONAL-READINESS.md)
- [Analytics HTTP](../../http/analytics/README.md)
- [Workbench](../../workbench/analytics/README.md)
