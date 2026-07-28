# APZHUB Product Management Handbook

> **Programme:** APZHUB-PRODUCT-MANAGEMENT-001  
> **Classification:** DOCUMENTATION ONLY  
> **Status:** **ACCEPTED / CLOSED / Operational** (APZHUB-OWNER-001)  
> **Date:** 2026-07-19  
> **Authority:** Owner Programme Approval · [AI-MANIFEST](../foundation/AI-MANIFEST.md) · [Product Portfolio](../products/APZHUB-PRODUCT-PORTFOLIO.md)

---

## 1. Purpose

This handbook is the operating manual for **commercial product management** across APZHUB. It governs how products are positioned, editioned, licensed, priced (principles only), roadmapped, measured, and taken to market.

It does **not** replace:

- Engineering Operating Model ([docs/operations/](../operations/README.md))
- Product Engineering Framework ([docs/products/](../products/README.md))
- Enterprise Architecture Catalogue ([ENTERPRISE-ARCHITECTURE-CATALOGUE](../architecture/ENTERPRISE-ARCHITECTURE-CATALOGUE.md))
- Release SemVer register ([PORTFOLIO-RELEASE-REGISTER](../releases/PORTFOLIO-RELEASE-REGISTER.md))

---

## 2. Scope

Applies to every commercial APZ product:

| Product          | Commercial role (portfolio)     |
| ---------------- | ------------------------------- |
| APZ Projects     | Suite                           |
| APZ Time         | Suite                           |
| APZ Support      | Suite                           |
| APZ Documents    | Suite                           |
| APZ Analytics    | Suite (Concept)                 |
| APZ Workflow     | Suite                           |
| APZ TCMS         | Specialised quality product     |
| APZ Law Platform | **Primary commercial vertical** |

---

## 3. Product management principles

1. **APZHUB brand first** — user-facing names are APZ products; engine brands (Plane, Kimai, Zammad, Metabase, n8n, …) stay connector-internal.
2. **Self-hosted OSS first** — Community Edition engines and self-hosted deployment are the default commercial posture; SaaS/hosted is an edition/deployment choice, not a redesign.
3. **Platform before product** — products extend the closed Platform Foundation; they do not fork architecture.
4. **Edition honesty** — edition claims must match certified capability; no vapourware features in published editions.
5. **No silent pricing** — this framework defines pricing _principles_ only; actual prices require separate Owner commercial decision (out of band).
6. **Lifecycle clarity** — commercial stages (Concept → Retirement) are distinct from engineering programme states.
7. **Owner-gated releases** — Patch / Minor / Major SemVer remain Owner-approved ([RELEASE-GOVERNANCE-CHECKLIST](../releases/RELEASE-GOVERNANCE-CHECKLIST.md)).
8. **Three-pillar governance** — Engineering, Architecture, and Commercial Product Management must stay aligned.

---

## 4. Roles (commercial)

| Role                        | Responsibility                                                                                   |
| --------------------------- | ------------------------------------------------------------------------------------------------ |
| Product Owner (per product) | Positioning, roadmap priority, edition scope, acceptance of product packs                        |
| Portfolio Owner             | Cross-product suite strategy, bundling, Law vs suite priority                                    |
| Commercial Owner            | Licensing models, pricing principles, partner/OEM terms (Owner-level)                            |
| Engineering Lead            | Feasibility, architecture compliance, delivery under approved programmes                         |
| Release Owner               | SemVer packaging evidence vs [PRODUCT-RELEASE-STANDARD](../products/PRODUCT-RELEASE-STANDARD.md) |

---

## 5. Document map

| Topic                        | Document                                                             |
| ---------------------------- | -------------------------------------------------------------------- |
| Commercial lifecycle stages  | [PRODUCT-LIFECYCLE.md](./PRODUCT-LIFECYCLE.md)                       |
| Editions                     | [PRODUCT-EDITIONS.md](./PRODUCT-EDITIONS.md)                         |
| Licensing models             | [PRODUCT-LICENSING.md](./PRODUCT-LICENSING.md)                       |
| Pricing principles           | [PRICING-STRATEGY.md](./PRICING-STRATEGY.md)                         |
| Feature governance           | [FEATURE-MANAGEMENT.md](./FEATURE-MANAGEMENT.md)                     |
| Roadmap process              | [ROADMAP-MANAGEMENT.md](./ROADMAP-MANAGEMENT.md)                     |
| Customer journey             | [CUSTOMER-JOURNEY.md](./CUSTOMER-JOURNEY.md)                         |
| Personas                     | [PERSONA-CATALOGUE.md](./PERSONA-CATALOGUE.md)                       |
| KPIs                         | [PRODUCT-KPI-CATALOGUE.md](./PRODUCT-KPI-CATALOGUE.md)               |
| Go-to-market                 | [GO-TO-MARKET.md](./GO-TO-MARKET.md)                                 |
| Commercial release stages    | [PRODUCT-RELEASE-LIFECYCLE.md](./PRODUCT-RELEASE-LIFECYCLE.md)       |
| Competitor framing           | [COMPETITOR-MAPPING.md](./COMPETITOR-MAPPING.md)                     |
| Per-product commercial cards | [COMMERCIAL-PRODUCT-CATALOGUE.md](./COMMERCIAL-PRODUCT-CATALOGUE.md) |
| Edition × product matrix     | [PRODUCT-EDITION-MATRIX.md](./PRODUCT-EDITION-MATRIX.md)             |
| Portfolio commercial roadmap | [COMMERCIAL-ROADMAP.md](./COMMERCIAL-ROADMAP.md)                     |

---

## 6. Operating cadence (recommended)

| Cadence                | Activity                                                     |
| ---------------------- | ------------------------------------------------------------ |
| Weekly                 | Feature triage vs edition boundaries                         |
| Monthly                | KPI review (Adoption, Usage, Quality, Support)               |
| Quarterly              | Roadmap / edition / GTM refresh                              |
| Per release            | Commercial release checklist + engineering release checklist |
| On Owner Approval only | New prices, new license SKUs, new editions, Major SemVer     |

---

## 7. Forbidden without Owner Approval

- Implementing licensing enforcement or entitlement services
- Publishing numeric prices in-repo
- Claiming SaaS/OEM/Government availability without edition matrix update
- Product implementation programmes
- Architecture changes to frozen waves

---

## Operating rule

APZHUB-PRODUCT-MANAGEMENT-001 is **ACCEPTED / CLOSED / Operational**. No commercial systems implementation without separate Owner Approval.
