# APZHUB Integration Catalogue (Enterprise Architecture)

> **Programme:** APZHUB-ARCHITECTURE-001  
> **Classification:** DOCUMENTATION ONLY  
> **Detail SoT:** [foundation/INTEGRATION-CATALOGUE](../foundation/INTEGRATION-CATALOGUE.md) · [OSS-CATALOGUE](../foundation/OSS-CATALOGUE.md) · [INTEGRATION-PRODUCT-CAPABILITY-INVENTORY](../foundation/INTEGRATION-PRODUCT-CAPABILITY-INVENTORY.md)  
> **Date:** 2026-07-19

---

## Purpose

EA inventory of **integrations** (adapters). Engine brands are connector-internal.

---

## On-disk integrations

| Integration        | Provider       | Package                              | Version   | Certification                     | Compatibility (summary)           | Platform consumers           | Health / Diagnostics | Status                               |
| ------------------ | -------------- | ------------------------------------ | --------- | --------------------------------- | --------------------------------- | ---------------------------- | -------------------- | ------------------------------------ |
| **Plane**          | Plane CE       | `@apzhub/integration-plane`          | **0.6.0** | Certified Reference (Wave 1)      | CE self-hosted (see adapter docs) | Projects services / HTTP     | Adapter health ops   | **Production**                       |
| **Kimai**          | Kimai CE       | `@apzhub/integration-kimai`          | **0.2.0** | **CERTIFIED_DOMAIN**              | Kimai 2.x CE (see Kimai docs)     | Time services / HTTP         | Ops + readiness      | **Production**                       |
| **Zammad**         | Zammad CE      | `@apzhub/integration-zammad`         | **0.6.0** | CERTIFIED_WITH_LIMITATIONS        | CE (see Zammad docs)              | Support services / HTTP / UI | Ops + cert           | **Production**                       |
| **Meilisearch**    | Meilisearch    | `@apzhub/integration-meilisearch`    | **0.1.0** | Search Reference                  | Search Publication stack          | Search execution             | Adapter health       | **Production** (frozen search plane) |
| **n8n**            | n8n            | `@apzhub/integration-n8n`            | **0.1.0** | Official Reference · frozen       | Metadata only                     | Workflow engine facet        | Health / version     | **Production** (read-only)           |
| **GitHub Actions** | GitHub Actions | `@apzhub/integration-github-actions` | **0.1.0** | Official CI/CD Reference · frozen | CI metadata                       | APZ TCMS / testing           | Diagnostics          | **Production** (reference)           |

**SDK:** `@apzhub/integration-sdk` **1.0.0** — Architecture Frozen.

---

## Absent / future providers (no adapter package)

| Provider          | Planned product / use   | Status                                                |
| ----------------- | ----------------------- | ----------------------------------------------------- |
| **Metabase**      | APZ Analytics           | **Concept / Planned** — ABSENT                        |
| **Paperless-ngx** | Documents OSS path      | **Planned** — ABSENT (native Documents SoR exists)    |
| **Grafana**       | Observability UI engine | **Planned** — ABSENT (native Observe SoR is metadata) |
| **Prometheus**    | Metrics engine          | **Planned** — ABSENT                                  |
| **Loki**          | Logs engine             | **Planned** — ABSENT                                  |
| **Faraday**       | Security Ops            | **Planned** — ABSENT                                  |
| **MobSF**         | Mobile security         | **Planned** — ABSENT                                  |
| **Greenbone**     | Vulnerability Ops       | **Planned** — ABSENT                                  |
| **Kiwi TCMS**     | Testing (legacy plan)   | **Retired / SUPERSEDED** by native APZ TCMS           |

---

## Capabilities (pattern)

Every certified adapter exposes Integration SDK capabilities such as: health, authentication-bridge, error-translation, diagnostics (± domain capabilities per product).

Exact capability lists: per-adapter `integration.yaml` under `integrations/*/`.

---

## Related

- [ENTERPRISE-ARCHITECTURE-CATALOGUE.md](./ENTERPRISE-ARCHITECTURE-CATALOGUE.md)
- [PRODUCT-CATALOGUE.md](./PRODUCT-CATALOGUE.md)
