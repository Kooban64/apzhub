# APZ Law Platform — Release 1.0 Definition

> **Programme:** APZ-LAW-001  
> **Classification:** DOCUMENTATION ONLY  
> **Lifecycle phase:** Commercial Planning  
> **Standard:** [Platform Delivery Standard](../../engineering/platform-delivery/PLATFORM-DELIVERY-STANDARD.md)  
> **Date:** 2026-07-19  
> **Target SemVer (naming only):** **1.0.0**

---

## 1. Product vision

**APZ Law Platform** is APZHUB’s primary commercial vertical for legal practice management — matters, clients, documents, tasks, time, billing, calendar, and trust accounting — running on Platform Core inside an APZHUB Workbench experience.

**Philosophy:** Lawyers and staff work in one branded Law Platform. Core legal data is a **native** System of Record on platform PostgreSQL. Backend engine brands (Plane, Zammad, etc.) are never the Law product identity. Trust Accounting is a Law capability (LAW-015), not a separate commercial product.

Authority: [docs/products/law/VISION.md](../law/VISION.md) · [PRODUCT-CATALOGUE](../../foundation/PRODUCT-CATALOGUE.md) · Law Platform Reference Architecture.

---

## 2. Product identity

| Field            | Value                                                                              |
| ---------------- | ---------------------------------------------------------------------------------- |
| Commercial name  | **APZ Law Platform**                                                               |
| User-facing name | **Law Platform**                                                                   |
| Application      | `@apzhub/law-platform` **1.0.0** (`apps/law-platform`)                             |
| Domain package   | `@apzhub/legal-business-core` **1.0.0**                                            |
| Service id       | `legal-platform` **1.0.0**                                                         |
| SoR              | Platform PostgreSQL (native Law schemas) — not Plane/Zammad for core Law           |
| Trust            | In-product Trust Accounting (LAW-015 closed)                                       |
| Surfaces         | Law app Workbench · LAW OpenAPI v1 · platform `/api/platform/v1/*` in law-platform |

---

## 3. Target market

| Segment                                    | Planning note                                              |
| ------------------------------------------ | ---------------------------------------------------------- |
| Law firms / legal practices                | Primary commercial narrative (practice management + trust) |
| Regulated / compliance-sensitive practices | Trust, audit, permission sensitivity as differentiators    |
| Self-hosted / enterprise operators         | Aligns with APZHUB self-hosted OSS-first platform posture  |

Prices and contractual GTM terms are **Owner-gated** — none invented in this pack.

---

## 4. Practice areas

Repository evidence describes **general legal practice management** domains (matters, clients, documents, time, billing, calendar, trust). It does **not** productise named practice-area SKUs (e.g. family, conveyancing, litigation packs) as separate Release 1.0 commercial modules.

| Practice framing                             | Release 1.0 posture                                   |
| -------------------------------------------- | ----------------------------------------------------- |
| General practice / matter-centric operations | **In scope** (package existing domains)               |
| Jurisdiction-specific court e-filing packs   | **Out of scope** unless separately evidenced/approved |
| Specialised practice-area product lines      | **Post-1.0** themes (see ROADMAP)                     |

Do not invent practice-area features absent from disk.

---

## 5. Target users

| Persona                   | Primary use                                                   |
| ------------------------- | ------------------------------------------------------------- |
| Lawyer / attorney         | Matters · documents · tasks · calendar · time                 |
| Paralegal                 | Matter support · documents · tasks                            |
| Practice manager          | Dashboard · clients · operations · reports                    |
| Trust accountant          | Trust ledger · reconciliation · approvals · interest          |
| Billing / finance ops     | Time → invoices (in-Law billing; FIN-001 deferred)            |
| Firm admin                | Administration · permissions · provisioning adjacency         |
| Platform ops / superadmin | Health · governance · security diagnostics (permission-gated) |

Authority: Definition Pack VISION · PRODUCT-CATALOGUE.

---

## 6. Release 1.0 intent

Deliver the first **commercial APZ Law Platform product SemVer (1.0.0)** by packaging the existing Law vertical (LAW-001…015 · `apps/law-platform`) under honest Known Limitations — **not** by rebuilding the product via full PDS greenfield phases.

---

## 7. In scope (Release 1.0)

### 7.1 Foundation on disk (productise / package)

| Capability                                 | Disk evidence                                                 |
| ------------------------------------------ | ------------------------------------------------------------- |
| Matters · Clients · Documents · Tasks      | App components · OpenAPI · manifests                          |
| Time · Billing / invoices                  | App + OpenAPI billing/time                                    |
| Calendar                                   | App calendar + OpenAPI calendar                               |
| Trust Accounting                           | LAW-015 · trust components/services                           |
| Search / Knowledge                         | Law search surfaces · knowledge registrations in service.yaml |
| Dashboard · Reports · Administration       | Manifests + app surfaces                                      |
| Identity / AuthZ consumption               | BetterAuth + platform-authorization packages                  |
| Events / notifications / activity patterns | ENF · activity frameworks consumed by law-platform            |

### 7.2 Commercial packaging deliverables (future programme)

| Deliverable                                     | Disk today                           |
| ----------------------------------------------- | ------------------------------------ |
| `docs/releases/law/1.0.0/` evidence pack        | **Absent**                           |
| Commercial product/admin/user guides for SemVer | Partial architecture/definition docs |
| Certified PRWL (or conditions) declaration      | **Pending** packaging                |

---

## 8. Out of scope (Release 1.0)

- Greenfield Full Platform Delivery Lifecycle re-implementation
- Financial Engine extraction (FIN-001 **DEFER**)
- Court e-filing / external DMS / external accounting suite integrations (historical Phase 2+)
- Treating placeholder UX as complete without documentation
- Claiming commercial Production without packaging certification
- Email as a first-class Law product SoR (not evidenced)
- Unauthorised new practice-area product lines

---

## 9. Commercial editions

See [COMMERCIAL-EDITIONS.md](./COMMERCIAL-EDITIONS.md). Primary narrative: Professional / Enterprise with Trust emphasis; Community limited if matrix requires.

---

## 10. Success outcomes (planning)

- Users interact with Law through APZHUB surfaces only
- Commercial SemVer **1.0.0** pack exists with certification class and Known Limitations
- Delivery path remains **Existing Platform → Commercial Packaging**
- Residual OBS / polish items visible — never silent

---

## 11. Non-goals

- Redesigning frozen Platform Foundation / Integration SDK without ADR + Owner
- Authorising implementation by this document alone
- Substituting conversation history for repository evidence
