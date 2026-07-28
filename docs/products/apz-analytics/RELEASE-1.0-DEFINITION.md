# APZ Analytics — Release 1.0 Definition

> **Programme:** APZ-ANALYTICS-001  
> **Classification:** DOCUMENTATION ONLY  
> **Date:** 2026-07-19  
> **Target SemVer (naming only):** **1.0.0** — not authorised until Owner Acceptance of a future release programme

---

## 1. Product identity

| Field            | Value                                                                                                               |
| ---------------- | ------------------------------------------------------------------------------------------------------------------- |
| User-facing name | **APZ Analytics**                                                                                                   |
| Commercial role  | Suite add-on / Enterprise attach ([Commercial Catalogue](../../product-management/COMMERCIAL-PRODUCT-CATALOGUE.md)) |
| Engine (planned) | Metabase CE — brand masked ([OSS catalogue Wave 6](../../architecture/APZHUB-OSS-Product-Integration-Catalog.md))   |
| Request path     | Module → Gateway → Auth → Authz → Platform Analytics Service → Metabase Adapter → Engine                            |

---

## 2. Release 1.0 intent

Deliver the first **governed analytics Workbench** for APZHUB operators and leaders: curated dashboards across Projects, Time, Support, and platform health — without exposing Metabase login or branding to standard users.

---

## 3. In scope (Release 1.0)

| Capability                 | Description                                                                          | Evidence / note                                                                     |
| -------------------------- | ------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------- |
| **Executive Dashboards**   | High-level suite KPIs for sponsors                                                   | Planned — no product surface on disk                                                |
| **Operational Dashboards** | Day-to-day ops views                                                                 | Planned                                                                             |
| **Project Analytics**      | Delivery / workload views over Projects data plane                                   | Plane has adapter-level analytics today; product Analytics absent                   |
| **Time Analytics**         | Utilisation / entry aggregates                                                       | Time Production **1.0.0** exists; Analytics product path absent                     |
| **Support Analytics**      | Ticket / SLA style views                                                             | `SupportAnalyticsService` exists for Support domain — **not** APZ Analytics product |
| **Platform Health**        | Hierarchical health summary (consume, not replace Observe SoR)                       | Health APIs exist; Analytics presentation absent                                    |
| **Repository Metrics**     | Selected engineering/quality indicators (consume Metrics SoR metadata where allowed) | Metrics SoR frozen — **metadata**, not PromQL engine                                |
| **Role-based dashboards**  | Permission-filtered dashboard catalogue                                              | IAM/AuthZ platform ready; Analytics permissions absent                              |
| **Saved dashboards**       | User/org saved dashboard preferences                                                 | Preference platform exists; Analytics prefs absent                                  |
| **Navigation**             | Activity Bar / Sidebar Analytics module                                              | Workbench framework ready; module absent                                            |
| **Search integration**     | Index dashboard title/description only                                               | Search Publication frozen; no Analytics provider                                    |
| **Permissions**            | `analytics.*` permission keys                                                        | Not on disk                                                                         |
| **Known exclusions**       | See §5                                                                               | Mandatory honesty                                                                   |

---

## 4. Non-goals / boundary (mandatory)

| Adjacent platform capability                | Relationship to APZ Analytics 1.0                                      |
| ------------------------------------------- | ---------------------------------------------------------------------- |
| Platform Metrics SoR (APZMETRICS-006)       | **Do not redesign** — consume metadata only where appropriate          |
| Platform Observability SoR (APZOBSERVE-006) | **Do not redesign** — health presentation may link; not Grafana        |
| Platform Reporting (APZREPORT-003)          | Distinct — reporting placeholders ≠ Analytics BI                       |
| Support / Plane domain analytics            | Remain domain services — may **feed** Analytics later; not substitutes |

---

## 5. Known exclusions (Release 1.0)

Explicitly **out of scope**:

- Advanced AI Analytics
- Predictive Analytics
- Machine Learning
- External BI (Power BI, Looker, etc.) as primary engine
- Customer-facing external reporting portals
- Custom SQL Builder for end users
- Embedded Report Designer / arbitrary question builder for end users
- Direct Metabase login for standard users
- Engine brand exposure in UI
- Hosted SaaS Analytics SKU (self-hosted first)

---

## 6. Deployment & licensing (commercial framing)

| Field         | Release 1.0 posture                                                                                                                     |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Deployment    | Self-hosted (Metabase CE + APZHUB)                                                                                                      |
| Licensing     | Commercial APZHUB module + Open Source Metabase CE                                                                                      |
| Edition floor | Professional / Enterprise (Community optional later) — see [PRODUCT-EDITION-MATRIX](../../product-management/PRODUCT-EDITION-MATRIX.md) |
| Prices        | None in-repo                                                                                                                            |

---

## 7. Success criteria (Release 1.0 — when eventually shipped)

1. Users open Analytics only via APZHUB Workbench.
2. Dashboards load through Platform Service → Adapter path only.
3. Permissions filter catalogue and embeds.
4. Metabase branding masked for standard users.
5. Certification evidence pack filed under `docs/releases/analytics/1.0.0/` (future).
6. QA-002 PRODUCTION READY retained.

---

## Related

- [IMPLEMENTATION-PLAN.md](./IMPLEMENTATION-PLAN.md)
- [KNOWN-LIMITATIONS.md](./KNOWN-LIMITATIONS.md)
- [IMPLEMENTATION-READINESS.md](./IMPLEMENTATION-READINESS.md)
