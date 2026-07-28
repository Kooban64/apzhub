# APZ TCMS — Delivery Path Determination

> **Programme:** APZ-TCMS-001  
> **Classification:** DOCUMENTATION ONLY  
> **Date:** 2026-07-19  
> **Standard:** [Platform Delivery Standard](../../engineering/platform-delivery/PLATFORM-DELIVERY-STANDARD.md)  
> **Authority:** Repository evidence only — no conversation history

---

## Question

Is APZ TCMS:

1. An **existing frozen / certified platform capability** requiring **commercial packaging**, or
2. A **new platform capability** requiring the **full Platform Delivery Standard lifecycle**?

---

## Verdict

# Existing Platform → Commercial Packaging

| Criterion                   | Evidence                                                                                                          | Implication                                   |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| Native product architecture | [ADR-0059](../../adr/ADR-0059-apz-tcms-native-product-architecture.md) **Accepted** — native SoR; Kiwi superseded | Not a greenfield engine product               |
| Engineering programmes      | APZTCMS-001…024 **complete** ([Milestone Roadmap](../../backlog/APZTCMS-Milestone-Roadmap.md))                    | Platform vertical already delivered           |
| Packages on disk            | `testing-contracts` / `persistence` / `services` **0.11.0** · `testing-foundation` **0.1.0**                      | Contracts + services present                  |
| CI/CD adapter               | `@apzhub/integration-github-actions` **0.1.0** · Reference Adapter **frozen** (APZTCMS-020)                       | Provider integration present for GHA          |
| HTTP APIs                   | `/api/v1/testing/*` (requirements, plans, suites, cases, executions, pipelines, certifications, …)                | HTTP phase already exists                     |
| Workbench                   | `apps/web/components/testing/*` · module `testing`                                                                | Workbench phase already exists                |
| Search                      | `@apzhub/search-testing` **0.1.1** (Search Publication frozen)                                                    | Search integration present                    |
| Vertical certification      | GHA vertical **PRODUCTION_READY_WITH_LIMITATIONS** (APZTCMS-019) · other slices PRWL where certified              | Platform certification exists                 |
| Commercial SemVer           | **No** `docs/releases/tcms/` (or equivalent product PR)                                                           | Gap = **packaging**, not platform rebuild     |
| Kiwi TCMS                   | **ABSENT** — no `integrations/kiwi` · path superseded                                                             | Do not start Kiwi as Release 1.0 prerequisite |

---

## Why not Full Platform Delivery Lifecycle

Re-running Commercial Planning → Platform Foundation → Information Model → Provider Integration → Contracts → Services → HTTP → Workbench would **duplicate** completed APZTCMS programmes and risk freeze conflicts (GHA Reference Adapter Standard frozen; Search Publication frozen).

The Platform Delivery Standard still applies: Release 1.0 proceeds via **Product Certification → Production Release** packaging programmes, citing existing phase evidence.

---

## Lifecycle map (current state)

| PDS phase                  | APZ TCMS status                                                          |
| -------------------------- | ------------------------------------------------------------------------ |
| Commercial Planning        | **This programme**                                                       |
| Platform Foundation        | **Complete** (APZTCMS-001 + ADR-0059)                                    |
| Information Model / Domain | **Complete** (domain contracts · architecture corpus)                    |
| Provider Integration       | **Complete** for GHA reference · Kiwi **superseded** · GitLab **future** |
| Contracts                  | **Complete** (`@apzhub/testing-contracts` **0.11.0**)                    |
| Platform Services          | **Complete** (`testing-services` **0.11.0** · `gateway.testing.*`)       |
| HTTP API                   | **Complete** (`/api/v1/testing/*`)                                       |
| Workbench Module           | **Complete** (`testing` module surfaces)                                 |
| Product Certification      | **Pending** commercial programme                                         |
| Production Release         | **Pending** SemVer evidence folder                                       |

---

## Authorised next direction (planning only)

After Owner Acceptance of APZ-TCMS-001, recommend a named **packaging/certification** programme (e.g. APZ-TCMS-002) — not Foundation re-implementation, not Kiwi, not GitLab/AI unless separately approved.
