# APZ TCMS — Release 1.0 Definition

> **Programme:** APZ-TCMS-001  
> **Classification:** DOCUMENTATION ONLY  
> **Lifecycle phase:** Commercial Planning  
> **Standard:** [Platform Delivery Standard](../../engineering/platform-delivery/PLATFORM-DELIVERY-STANDARD.md)  
> **Date:** 2026-07-19  
> **Target SemVer (naming only):** **1.0.0**

---

## 1. Product vision

**APZ TCMS** is APZHUB’s native Test & Certification Management System — the single Workbench for requirements traceability, manual and automated test orchestration, evidence, defects, coverage, quality gates, and formal release certification.

**Philosophy:** TCMS **orchestrates** testing. Execution engines remain independent; results are ingested via Integration SDK–pattern adapters. Users see **Testing** and **Certification** — never Kiwi, Playwright, Vitest, or other engine brands as the product identity.

Authority: [Product Vision](../../strategy/APZHUB-APZ-TCMS-Product-Vision.md) · [ADR-0059](../../adr/ADR-0059-apz-tcms-native-product-architecture.md).

---

## 2. Product identity

| Field                             | Value                                                                          |
| --------------------------------- | ------------------------------------------------------------------------------ |
| Commercial name                   | **APZ TCMS**                                                                   |
| User-facing module                | **Testing** (Certification views within module)                                |
| Module ID                         | `testing`                                                                      |
| Platform services                 | `TestingService` · `CertificationService` (and related gateway.testing facets) |
| SoR                               | Platform PostgreSQL (metadata) · S3-compatible evidence blobs                  |
| Primary CI provider (Release 1.0) | **GitHub Actions** Reference Adapter (read-only metadata — certified PRWL)     |
| External TCMS (Kiwi)              | **Not** Release 1.0 — path superseded; no adapter                              |
| Surfaces                          | Workbench Testing module · HTTP `/api/v1/testing/*`                            |

---

## 3. Target users

| Persona         | Primary use                                            |
| --------------- | ------------------------------------------------------ |
| Executive       | Release confidence · certification status · dashboards |
| QA Lead         | Plans · suites · cases · coverage · gates              |
| Tester          | Manual execution · evidence                            |
| Developer       | Automation results · defects                           |
| Project Manager | Traceability · schedule adjacency to Projects          |
| Compliance      | Audit · approvals · sign-off                           |
| Ops / Admin     | Health · permissions · CI provider config (refs)       |
| Support         | Defect / ticket correlation (where wired)              |

Personas detail: [APZHUB-APZ-TCMS-User-Personas](../../product/APZHUB-APZ-TCMS-User-Personas.md).

---

## 4. Release 1.0 intent

Deliver the first **commercial APZ TCMS product SemVer (1.0.0)** by packaging the existing APZTCMS platform vertical (001…024) — including certified GHA CI metadata path — under APZHUB branding with honest Known Limitations.

Release 1.0 is **commercial packaging / certification**, not a platform rebuild and not a Kiwi integration programme.

---

## 5. In scope (Release 1.0)

### 5.1 Foundation on disk (productise / package)

| Capability                                      | Disk evidence                                          |
| ----------------------------------------------- | ------------------------------------------------------ |
| Requirements · Plans · Suites · Cases           | `/api/v1/testing/*` · testing-* packages               |
| Executions (manual + automated model)           | HTTP + Workbench execution views                       |
| Evidence · Defects · Coverage · Quality gates   | Present surfaces                                       |
| Certification · Approvals                       | Certification views + APIs                             |
| Pipelines / CI metadata (GHA)                   | `integration-github-actions` **0.1.0** · pipelines API |
| Engineering Intelligence · Executive dashboards | APZTCMS-021…023                                        |
| Reporting framework adjacency                   | APZTCMS-024 · platform reporting consumer patterns     |
| Search publication                              | `search-testing` **0.1.1**                             |
| Permissions / AuthZ                             | Testing authorization guides · server-authoritative    |

### 5.2 Commercial packaging deliverables (future programme)

| Deliverable                                       | Disk today                                         |
| ------------------------------------------------- | -------------------------------------------------- |
| `docs/releases/tcms/1.0.0/` evidence pack         | **Absent**                                         |
| Product RELEASES.md / portfolio register row      | Partial catalogue only                             |
| Commercial guides (product/admin/user) for SemVer | Architecture guides exist; commercial pack pending |

---

## 6. Out of scope (Release 1.0)

- Kiwi TCMS adapter / SSO / sync
- GitLab CI Reference Adapter (future Owner milestone)
- AI Assist / AI auto-certification
- Becoming Vitest/Playwright/Jest (or any runner) itself
- Redesigning frozen GHA Reference Adapter Standard without ADR + Owner
- Full Platform Delivery Lifecycle re-implementation of 001…006 phases

---

## 7. Deployment & licensing (framing)

| Field                 | Release 1.0 posture                                                 |
| --------------------- | ------------------------------------------------------------------- |
| Deployment            | Self-hosted APZHUB                                                  |
| Licensing             | Commercial APZHUB TCMS (suite / enterprise cert tier per catalogue) |
| External TCMS license | Not required (native SoR)                                           |
| Prices                | None in-repo                                                        |

---

## 8. Success criteria (when packaged)

1. Users operate Testing/Certification only via APZHUB Workbench/HTTP.
2. Engine brands masked; Kiwi never presented as SoR.
3. Layered path Module → Gateway → Platform Service → Adapter (where used) held.
4. SemVer evidence under `docs/releases/tcms/1.0.0/` (future programme).
5. Known Limitations honest (GHA read-only CI metadata, deferred GitLab/AI, etc.).
6. QA-002 PRODUCTION READY retained; freezes respected.

---

## Related

- [FEATURE-CATALOGUE.md](./FEATURE-CATALOGUE.md)
- [DELIVERY-PATH.md](./DELIVERY-PATH.md)
- [IMPLEMENTATION-READINESS.md](./IMPLEMENTATION-READINESS.md)
