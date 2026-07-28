# APZ Analytics — Implementation Backlog (Release 1.0)

> **Programme:** APZ-ANALYTICS-001  
> **Classification:** DOCUMENTATION ONLY  
> **Date:** 2026-07-19  
> **Rule:** Themes only — **does not invent programme IDs**. Delivery requires named Owner Approvals.

---

## Epic themes

### E1 — Metabase connector

- Scaffold `integrations/metabase` per Integration SDK
- Health, auth bridge, error translation, diagnostics
- Embed URL / JWT issuance capability (connector-internal)
- Collection / group mapping capability
- Compatibility matrix (Metabase CE versions)
- Certification pack (adapter)

### E2 — Analytics architecture & contracts

- ADR: Analytics vs Metrics vs Reporting vs Observability
- `AnalyticsService` interface catalogue
- Permission keys + AuthZ map
- Dashboard registry domain model (platform metadata)
- Event catalogue candidates (dashboard.viewed — design only until Event Bus programmes)

### E3 — Platform services & HTTP

- Service implementations + gateway facets
- Validation · audit · rate limits
- OpenAPI `/api/v1/analytics/**`
- Typed client for Workbench
- Caching policy for tokens/catalogue

### E4 — Workbench product

- `module.yaml` + navigation entries
- Dashboard list / detail / embed host
- Role-based default views
- Saved dashboards (prefs)
- Empty / loading / error states (Design System)
- Branding mask (no Metabase chrome for standard users)

### E5 — Cross-cutting

- Search provider (title/description)
- Health hierarchy registration
- Provisioning hooks (product enablement)
- Docs: operator guide · known limitations

### E6 — Quality & release

- Vitest contract/unit suites
- Playwright Analytics cert specs
- Certification audit
- `docs/releases/analytics/1.0.0/` packaging

---

## Priority order (planning)

1. E1 + E2 (blockers)
2. E3
3. E4
4. E5 (parallel late)
5. E6

---

## Explicitly deferred backlog (post-1.0)

See [ROADMAP-POST-1.0.md](./ROADMAP-POST-1.0.md) and Release 1.0 exclusions (AI/ML, SQL builder, external BI, etc.).

---

## Related

- [IMPLEMENTATION-PLAN.md](./IMPLEMENTATION-PLAN.md)
- Portfolio backlog themes: [analytics/BACKLOG.md](../analytics/BACKLOG.md)
