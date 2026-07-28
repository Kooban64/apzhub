# APZHUB Engineering Governance Dashboard Specification

> **Programme:** APZHUB-GOVERNANCE-001  
> **Title:** Engineering Governance Dashboard Specification  
> **Classification:** DOCUMENTATION ONLY — **no dashboard implementation authorised**  
> **Date:** 2026-07-19  
> **Status:** **ACCEPTED / CLOSED / Operational** (APZHUB-OWNER-001) — spec only; no UI  
> **Authority:** [Engineering Operating Model](../operations/ENGINEERING-OPERATING-MODEL.md) · [AI-MANIFEST](../foundation/AI-MANIFEST.md) · [QA-002](../foundation/completion-reports/APZHUB-QA-002-repository-quality-certification.md)  
> **Companions:** [PORTFOLIO-STATUS-MODEL](./PORTFOLIO-STATUS-MODEL.md) · [REPOSITORY-HEALTH-MODEL](./REPOSITORY-HEALTH-MODEL.md) · [CERTIFICATION-LIFECYCLE](./CERTIFICATION-LIFECYCLE.md) · [PROGRAMME-LIFECYCLE](./PROGRAMME-LIFECYCLE.md) · [GOVERNANCE-KPI-CATALOGUE](./GOVERNANCE-KPI-CATALOGUE.md) · [GOVERNANCE-DASHBOARD-DATA-MODEL](./GOVERNANCE-DASHBOARD-DATA-MODEL.md)

---

## 1. Purpose

This document is the **canonical engineering governance reference** for APZHUB.

It specifies _what_ an Engineering Governance Dashboard must show, _which statuses_ are legal, and _where_ values come from — without implementing UI, Grafana, APIs, or monitoring.

**STOP:** Do not create React components, Grafana dashboards, collectors, or APIs from this specification alone.

---

## 2. Design principles

| Principle                  | Rule                                                                  |
| -------------------------- | --------------------------------------------------------------------- |
| Repository-first           | Prefer disk + KF docs over conversation                               |
| Status model single source | Enums only from [PORTFOLIO-STATUS-MODEL](./PORTFOLIO-STATUS-MODEL.md) |
| Honesty                    | Limitations and PRWL must be visible                                  |
| Freeze visibility          | Frozen subsystems always listed                                       |
| Evidence-linked            | Every red/amber cell links to an artefact URI                         |
| Implementation-independent | Spec outlives any future tool choice                                  |
| Owner gates visible        | Approvals / Acceptances are first-class                               |

---

## 3. Dashboard information architecture

```text
┌─────────────────────────────────────────────────────────────┐
│ 0. Header — Repo health · SHA · QA certification · phase   │
├───────────────┬───────────────┬─────────────────────────────┤
│ 1. Repository │ 2. Portfolio  │ 3. Platform                 │
├───────────────┼───────────────┼─────────────────────────────┤
│ 4. Integrations│ 5. Engineering│ 6. Release Governance     │
├───────────────┼───────────────┼─────────────────────────────┤
│ 7. Programmes │ 8. Quality    │ 9. Automation readiness     │
└───────────────┴───────────────┴─────────────────────────────┘
```

---

## 4. Section specifications

### 4.1 Repository Health (header + Repository panel)

| Widget                   | Fields               | Status model                             |
| ------------------------ | -------------------- | ---------------------------------------- |
| Aggregate health         | `health`             | HEALTHY / DEGRADED / UNHEALTHY / UNKNOWN |
| Repository Certification | QA label             | Certification enums                      |
| Repository Status        | overall              | Repository status enums                  |
| QA Status                | tests                | Quality enums                            |
| Build Status             | build                | Quality enums                            |
| Lint Status              | lint                 | Quality enums                            |
| Typecheck Status         | types                | Quality enums                            |
| Security Status          | security             | Quality enums                            |
| Documentation Status     | docs                 | Quality enums                            |
| Architecture Status      | freezes / boundaries | Quality enums                            |

**Rules:** [REPOSITORY-HEALTH-MODEL](./REPOSITORY-HEALTH-MODEL.md).

**Illustrative current baseline (docs — not live UI):** QA-002 **PRODUCTION READY**; Engineering Foundation **COMPLETE**; phase **Operational Delivery**.

---

### 4.2 Product Portfolio

Display **one row per portfolio product**:

| Column                     | Description                                   |
| -------------------------- | --------------------------------------------- |
| Product                    | User-facing name (Projects, Time, Support, …) |
| Owner                      | Product Owner / role                          |
| Current Version            | SemVer if established                         |
| Current Production Release | From Release Register                         |
| Current Maturity           | Product status enum                           |
| Implementation Ready       | Yes / No / N/A                                |
| Release Line               | Patch / Minor / Major naming lines            |
| Known Limitations          | Link to KNOWN-LIMITATIONS.md                  |
| Latest Acceptance          | Link + ACCEPTED / Awaiting                    |
| Health                     | Derived traffic light                         |

**Sources:** [PORTFOLIO-RELEASE-REGISTER](../releases/PORTFOLIO-RELEASE-REGISTER.md) · [APZHUB-PRODUCT-PORTFOLIO](../products/APZHUB-PRODUCT-PORTFOLIO.md) · product packs.

**Illustrative Production trio:**

| Product      | Version | Maturity                    | Notes                      |
| ------------ | ------- | --------------------------- | -------------------------- |
| APZ Projects | 1.1.0   | PRODUCTION                  | ACCEPTED / CLOSED          |
| APZ Time     | 1.0.0   | PRODUCTION                  | ACCEPTED / CLOSED          |
| APZ Support  | 1.0.0   | PRODUCTION_WITH_LIMITATIONS | Packaging via RELEASES-001 |

---

### 4.3 Platform

| Row               | Shows                                 |
| ----------------- | ------------------------------------- |
| Platform Runtime  | version / OPERATIONAL                 |
| Integration SDK   | **1.0.0** FROZEN                      |
| Platform Services | version (e.g. **0.26.1**) OPERATIONAL |
| HTTP APIs         | OpenAPI version (e.g. **1.10.0**)     |
| Workbench         | Framework OPERATIONAL                 |
| Authentication    | BetterAuth — OPERATIONAL (auth only)  |
| Authorization     | Platform AuthZ — OPERATIONAL          |
| Provisioning      | **0.1.0** MVP/OPERATIONAL             |
| Configuration     | SoR FROZEN / OPERATIONAL per wave     |

Each row: `status`, `version`, `freezeUri?`, `health`.

---

### 4.4 Integrations

| Column             | Description                                 |
| ------------------ | ------------------------------------------- |
| Integration        | Capability id (plane, kimai, zammad, …)     |
| Provider           | Engine (internal column — not user UI copy) |
| Version            | Adapter package version                     |
| Compatibility      | Supported engine range summary              |
| Certification      | Integration status enum                     |
| Supported Versions | List / range                                |
| Health             | Traffic light                               |
| Diagnostics        | Available Y/N                               |
| Readiness          | ready / limited / not_ready                 |

**Illustrative:**

| Integration    | Version | Certification                 |
| -------------- | ------- | ----------------------------- |
| Plane          | 0.6.0   | CERTIFIED (Wave 1 reference)  |
| Zammad         | 0.6.0   | CERTIFIED_WITH_LIMITATIONS    |
| Kimai          | 0.2.0   | CERTIFIED_DOMAIN              |
| Meilisearch    | 0.1.0   | REFERENCE / search stack      |
| n8n            | 0.1.0   | REFERENCE_ADAPTER (read-only) |
| GitHub Actions | 0.1.0   | REFERENCE_ADAPTER             |

Absent portfolio engines (Metabase, Paperless, …) appear as `ABSENT`.

---

### 4.5 Engineering

| Widget                    | Content                                              |
| ------------------------- | ---------------------------------------------------- |
| Architecture Decisions    | Count of ADRs; link to `docs/adr/`                   |
| Active ADRs               | ADRs not superseded                                  |
| Architecture Freeze       | Table of frozen subsystems (from AI-MANIFEST)        |
| Standards Compliance      | PASS/WARN vs 001–029 / ops standards                 |
| Reference Implementations | Link to Product Engineering Reference Implementation |
| Repository Quality        | QA-002 label                                         |

---

### 4.6 Release Governance

| Widget                | Content                                                   |
| --------------------- | --------------------------------------------------------- |
| Active Releases       | In-delivery release programmes                            |
| Production Releases   | Register rows (Projects 1.1.0, Time 1.0.0, Support 1.0.0) |
| Patch / Minor / Major | Naming lines only — flag “not authorised”                 |
| Pending Releases      | Awaiting Acceptance                                       |
| Owner Approvals       | Open Approval gates                                       |

**Checklist reference:** [RELEASE-GOVERNANCE-CHECKLIST](../releases/RELEASE-GOVERNANCE-CHECKLIST.md).

---

### 4.7 Programme Governance

| Widget               | Content                                      |
| -------------------- | -------------------------------------------- |
| Current Programme    | CURRENT-MILESTONE active                     |
| Completed Programmes | Recent ACCEPTED_CLOSED                       |
| Pending Acceptance   | IMPLEMENTED_AWAITING_ACCEPTANCE              |
| Blocked Programmes   | BLOCKED + reason                             |
| Upcoming Programmes  | Recommended / declared next (not authorised) |

**Lifecycle:** [PROGRAMME-LIFECYCLE](./PROGRAMME-LIFECYCLE.md).

---

### 4.8 Quality

| Widget                   | Content                         |
| ------------------------ | ------------------------------- |
| Coverage                 | Optional % if configured        |
| Repository Certification | QA label + URI                  |
| Known Limitations        | Portfolio roll-up links         |
| Risk Register            | Link to OSS / product risk docs |
| Technical Debt           | Themes / counts from registers  |
| Documentation Quality    | KF completeness                 |

---

## 5. Cross-product & automation context (read-only widgets)

Optional footer widgets (not implementation):

| Widget                         | Source                                                                          |
| ------------------------------ | ------------------------------------------------------------------------------- |
| Portfolio Integration Strategy | [PORTFOLIO-INTEGRATION-STRATEGY](../products/PORTFOLIO-INTEGRATION-STRATEGY.md) |
| Event Catalogue coverage       | [PLATFORM-EVENT-CATALOGUE](../products/PLATFORM-EVENT-CATALOGUE.md)             |
| Automation Roadmap horizon     | [AUTOMATION-ROADMAP](../products/AUTOMATION-ROADMAP.md)                         |

---

## 6. Status model (summary)

Full enums: [PORTFOLIO-STATUS-MODEL](./PORTFOLIO-STATUS-MODEL.md).

| Domain        | Document section |
| ------------- | ---------------- |
| Repository    | §1               |
| Platform      | §2               |
| Integration   | §3               |
| Product       | §4               |
| Programme     | §5               |
| Release       | §6               |
| Quality       | §7               |
| Certification | §8               |
| Health        | §9               |

---

## 7. Certification & programme lifecycles

- [CERTIFICATION-LIFECYCLE](./CERTIFICATION-LIFECYCLE.md)
- [PROGRAMME-LIFECYCLE](./PROGRAMME-LIFECYCLE.md)

---

## 8. Automation readiness (future population)

How values **may** be populated later — **no collectors in this programme**:

| Source                     | Populates                                                                                |
| -------------------------- | ---------------------------------------------------------------------------------------- |
| **GitHub**                 | Tags, release names, PR/merge events, Actions run ids                                    |
| **CI/CD**                  | Build / lint / typecheck / test / security job conclusions                               |
| **Coverage Reports**       | Optional coverage % artefacts                                                            |
| **Release Metadata**       | PORTFOLIO-RELEASE-REGISTER, product RELEASES.md, release evidence folders                |
| **Documentation Metadata** | AI-MANIFEST, CURRENT-*, Acceptance/Completion Reports, freeze notices, KNOWN-LIMITATIONS |
| **Repository Metadata**    | package.json versions, integration.yaml, service.yaml, audit script exits                |

Logical schema: [GOVERNANCE-DASHBOARD-DATA-MODEL](./GOVERNANCE-DASHBOARD-DATA-MODEL.md).  
KPIs: [GOVERNANCE-KPI-CATALOGUE](./GOVERNANCE-KPI-CATALOGUE.md).

---

## 9. Access control (future UI)

| Audience                   | Access                                                                                                                                          |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Owner / PM                 | Full dashboard                                                                                                                                  |
| Technical Lead / Architect | Full                                                                                                                                            |
| Product engineers          | Portfolio + their product + quality                                                                                                             |
| Standard end users         | **No** — Administration Workspace only, permission-gated ([014](../014-observability-telemetry-monitoring-logging-administration-framework.md)) |

---

## 10. Non-goals

| Non-goal                                  | Reason                                         |
| ----------------------------------------- | ---------------------------------------------- |
| React / Workbench dashboard UI            | STOP                                           |
| Grafana / Prometheus boards               | STOP — Observability SoR frozen separately     |
| Live monitoring APIs                      | STOP                                           |
| Mutating engineering state from dashboard | Dashboard is read-only governance view         |
| Replacing KF docs                         | Dashboard **summarises** docs; docs remain SoT |

---

## 11. Success criteria (specification)

This programme succeeds when the repository contains a complete, implementation-independent governance specification covering:

- Repository Governance
- Platform Governance
- Product Governance
- Integration Governance
- Programme Governance
- Release Governance
- Quality Governance
- Certification Governance

---

## Related index

| Doc                     | Path                                                                                                                                          |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Status model            | [PORTFOLIO-STATUS-MODEL.md](./PORTFOLIO-STATUS-MODEL.md)                                                                                      |
| Repo health             | [REPOSITORY-HEALTH-MODEL.md](./REPOSITORY-HEALTH-MODEL.md)                                                                                    |
| Certification lifecycle | [CERTIFICATION-LIFECYCLE.md](./CERTIFICATION-LIFECYCLE.md)                                                                                    |
| Programme lifecycle     | [PROGRAMME-LIFECYCLE.md](./PROGRAMME-LIFECYCLE.md)                                                                                            |
| KPI catalogue           | [GOVERNANCE-KPI-CATALOGUE.md](./GOVERNANCE-KPI-CATALOGUE.md)                                                                                  |
| Data model              | [GOVERNANCE-DASHBOARD-DATA-MODEL.md](./GOVERNANCE-DASHBOARD-DATA-MODEL.md)                                                                    |
| Completion              | [APZHUB-GOVERNANCE-001-completion-report.md](../sprint/APZHUB-GOVERNANCE-001-completion-report.md)                                            |
| Acceptance              | [APZHUB-GOVERNANCE-001-programme-acceptance-report.md](../foundation/completion-reports/APZHUB-GOVERNANCE-001-programme-acceptance-report.md) |
