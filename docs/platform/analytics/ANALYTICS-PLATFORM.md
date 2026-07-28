# APZHUB Analytics Platform

> **Programme:** APZHUB-PLATFORM-ANALYTICS-001  
> **Classification:** DOCUMENTATION ONLY  
> **ADRs:** [ADR-0066](../../adr/ADR-0066-analytics-platform-boundaries.md) · [ADR-0067](../../adr/ADR-0067-metabase-analytics-provider.md)  
> **Date:** 2026-07-19

---

## 1. Purpose

Provide a **shared Analytics Platform capability** that:

1. Presents governed dashboards and analytics experiences under APZHUB branding
2. Orchestrates BI engine providers (initially Metabase CE) via Integration SDK adapters
3. Enforces AuthN/AuthZ, tenancy, audit, and health on every request
4. Serves **APZ Analytics** and future product/vertical analytics packs

It does **not** replace Observability, Metrics metadata SoR, or Platform Reporting.

---

## 2. Responsibilities

| Responsibility                           | Analytics Platform owns                             |
| ---------------------------------------- | --------------------------------------------------- |
| Dashboard registry (platform metadata)   | Yes — references + permissions + catalogue          |
| Embed / session bridge to BI engine      | Yes — via adapter                                   |
| Role-based dashboard catalogues          | Yes                                                 |
| Saved views / saved dashboards (prefs)   | Yes — platform prefs / analytics prefs SoR (future) |
| Query execution engine                   | **No** — provider (Metabase)                        |
| Metric definition governance             | **No** — Metrics SoR                                |
| Telemetry scrape / logs / traces engines | **No** — Observability path (future adapters)       |
| Document/report placeholder lifecycle    | **No** — Reporting SoR                              |
| Product Workbench UX for Analytics       | Consumed by APZ Analytics module (product layer)    |

---

## 3. Consumers

| Consumer                      | How                                                |
| ----------------------------- | -------------------------------------------------- |
| **APZ Analytics** product     | Primary Workbench module                           |
| Future product packs          | Projects / Time / Support / Law curated dashboards |
| Administration / ops personas | Platform health & suite analytics views            |
| Search                        | Dashboard title/description provider               |
| Notifications (future)        | Threshold alert events (out of foundation MVP)     |

---

## 4. Platform boundaries

```text
Presentation (APZ Analytics module / Workbench)
  → HTTP /api/v1/analytics/**
  → Auth → Authz → Validation (RequestPipeline)
  → Analytics Platform Services
  → Integration SDK Adapter (Metabase)
  → BI Engine (Metabase CE)
```

**Forbidden:** Module → Metabase; Service → Metabase without adapter; Analytics redesign of frozen Metrics/Observe/Reporting packages.

---

## 5. Separation map (canonical)

| Concern                      | Owner                                     | User-facing name        | Engine (today)                                                   |
| ---------------------------- | ----------------------------------------- | ----------------------- | ---------------------------------------------------------------- |
| **Analytics Platform**       | This foundation                           | APZ Analytics (product) | Metabase (planned, absent)                                       |
| **Observability SoR**        | APZOBSERVE-006 frozen                     | Observability Workbench | Grafana/Prom/Loki adapters **absent** — metadata SoR only        |
| **Metrics SoR**              | APZMETRICS-006 frozen                     | Metrics Workbench       | Metadata governance — not PromQL                                 |
| **Reporting**                | APZREPORT-003 PRWL                        | Reporting               | Native placeholders / TCMS reporting                             |
| **Business Intelligence**    | Subset of Analytics                       | (under Analytics)       | Metabase                                                         |
| **Dashboards**               | Analytics catalogue + embeds              | Dashboards              | Metabase collections                                             |
| **Operational reporting**    | Reporting + domain analytics              | Varies                  | Not Metabase-by-default                                          |
| **Repository / eng metrics** | May **appear** in Analytics curated views | —                       | Consume Metrics SoR metadata / health APIs — do not fork Metrics |

---

## 6. Supported capabilities (target foundation)

See [ANALYTICS-CAPABILITY-MODEL.md](./ANALYTICS-CAPABILITY-MODEL.md).

Summary: Dashboard Registry · Role-based catalogues · Saved dashboards · Embedding · Filtering · Sharing (permissioned) · Caching · Health · Diagnostics · Audit.

---

## 7. Non-goals

- Redesigning frozen Metrics / Observability / Reporting / Search Publication / Integration SDK
- Becoming Prometheus/Grafana productisation
- End-user SQL builder / ML / predictive analytics (product exclusions)
- Direct engine login for standard users
- Implementing adapters or services in this programme

---

## 8. Relationship to APZ-ANALYTICS-001

Product Release 1.0 planning (**ACCEPTED**, READY WITH CONDITIONS) depends on this platform foundation. Product implementation waits for platform prerequisites on disk.

---

## Related

- [ANALYTICS-SERVICE-ARCHITECTURE.md](./ANALYTICS-SERVICE-ARCHITECTURE.md)
- [OSS Wave 6 Metabase](../../architecture/APZHUB-OSS-Product-Integration-Catalog.md)
