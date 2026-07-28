# Analytics Platform — Integration Model

> **Programme:** APZHUB-PLATFORM-ANALYTICS-001  
> **Classification:** DOCUMENTATION ONLY  
> **ADR:** [ADR-0067](../../adr/ADR-0067-metabase-analytics-provider.md)  
> **Date:** 2026-07-19

---

## 1. Metabase (primary provider — foundation on disk)

| Aspect        | Model                                                                                                 |
| ------------- | ----------------------------------------------------------------------------------------------------- |
| Package       | `@apzhub/integration-metabase` **0.1.0**                                                              |
| SDK           | Integration SDK **1.0.0** (frozen)                                                                    |
| Role          | BI engine — health, auth, diagnostics, version/capability detection; collections metadata (read-only) |
| Auth bridge   | API key / session via SecretProvider; JWT/signed embed planned for Platform Services                  |
| Branding      | Masked for standard users — adapter-internal                                                          |
| On disk today | **PRESENT** — CERTIFIED_FOUNDATION (APZHUB-INTEGRATION-METABASE-001 Awaiting Acceptance)              |
| Docs          | [integrations/metabase](../../integrations/metabase/README.md)                                        |

Foundation capabilities: health, authentication, error-translation, diagnostics, version, readiness, collections-metadata; dashboard-embed **planned**.

License risk: OSS-T04 Metabase embed restrictions — legal review before embed token issuance ([risk register](../../governance/APZHUB-OSS-Integration-Risk-Register.md)).

---

## 2. Platform Services

Analytics Platform Services orchestrate adapters; hold registry SoR; never embed Metabase SDK in modules.

Pattern: same as Time Platform Services → Kimai adapter.

---

## 3. Identity & permissions

| Concern               | Integration                                          |
| --------------------- | ---------------------------------------------------- |
| AuthN                 | BetterAuth session                                   |
| AuthZ                 | Platform PermissionService                           |
| Identity Admin SoR    | Unchanged (frozen) — Analytics does not own identity |
| Role → Metabase group | Adapter mapping tables (connector-internal)          |

---

## 4. Workbench & navigation

| Concern    | Integration                                                        |
| ---------- | ------------------------------------------------------------------ |
| Shell      | Existing workbench-framework                                       |
| Module     | APZ Analytics `module.yaml` (product)                              |
| Navigation | Activity Bar + Sidebar via module registration (017)               |
| Embed host | Shared UI component in Design System / module — no Metabase chrome |

---

## 5. Search

Register Analytics Search Provider for dashboard titles/descriptions only (020).  
Publication plane frozen — additive provider registration only under Owner-approved programme.

---

## 6. Notifications

Out of Analytics Platform Foundation MVP. Future: provider alert webhooks → Platform Event → Attention Engine (021). Requires separate Approval.

---

## 7. Observability / Metrics / Reporting consumers

Analytics may **display** curated cards that _link_ or _summarise_ health/metrics metadata — it must not call Prometheus/Grafana (absent) or execute Metrics formulas. Deep links to Metrics/Observe Workbench are preferred over forking those SoRs.

---

## Related

- [ANALYTICS-SERVICE-ARCHITECTURE.md](./ANALYTICS-SERVICE-ARCHITECTURE.md)
- [OSS Product Integration Catalog — Wave 6](../../architecture/APZHUB-OSS-Product-Integration-Catalog.md)
