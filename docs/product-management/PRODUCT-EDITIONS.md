# APZHUB Product Editions

> **Programme:** APZHUB-PRODUCT-MANAGEMENT-001  
> **Classification:** DOCUMENTATION ONLY  
> **Matrix:** [PRODUCT-EDITION-MATRIX.md](./PRODUCT-EDITION-MATRIX.md)  
> **Date:** 2026-07-19

---

## Purpose

Define standard **editions** used to package APZ products for different markets. Editions are commercial packaging constructs — not separate architectures.

---

## Standard editions

| Edition          | Intent                                      | Typical buyer                  | Capability posture                                                          |
| ---------------- | ------------------------------------------- | ------------------------------ | --------------------------------------------------------------------------- |
| **Community**    | Entry / evaluation; CE engines; self-hosted | SMB, OSS adopters, pilots      | Core Workbench modules; documented limitations OK                           |
| **Professional** | Full suite productivity for teams           | Mid-market ops / delivery orgs | Full suite modules certified for Production; standard support               |
| **Enterprise**   | Scale, governance, multi-tenant readiness   | Large enterprises              | Advanced admin, audit, observability metadata, SLAs (commercial), SSO depth |
| **Government**   | Public-sector controls and assurance        | Agencies / regulated           | Enterprise baseline + sovereignty / audit / compliance packaging            |
| **OEM**          | Embedded / white-label under partner brand  | ISVs / OEMs                    | Presentation Engine branding; constrained module set; partner license       |
| **Partner**      | Channel / MSP resale and delivery           | Partners / MSPs                | Professional/Enterprise features under partner agreement                    |

---

## Edition rules

1. **One platform** — editions differ by entitlement, support, branding, and optional modules — not by forked codebases.
2. **Engine brands masked** in all editions for standard users.
3. **Community** must not claim Enterprise-only controls.
4. **OEM / Partner** require separate commercial agreements (out of band); this doc only frames the edition.
5. Edition entitlement **enforcement** is not implemented in this programme.

---

## Mapping to deployment

| Edition      | Default deployment             | Notes                         |
| ------------ | ------------------------------ | ----------------------------- |
| Community    | Self-hosted                    | Docker / compose path         |
| Professional | Self-hosted (primary)          | Optional hosted later         |
| Enterprise   | Self-hosted or Hybrid          | Tenant / org controls         |
| Government   | Self-hosted / sovereign Hybrid | Data residency messaging      |
| OEM          | As contracted                  | Often self-hosted at customer |
| Partner      | As contracted                  | May include managed hosting   |

---

## Related

- [PRODUCT-LICENSING.md](./PRODUCT-LICENSING.md)
- [PRODUCT-EDITION-MATRIX.md](./PRODUCT-EDITION-MATRIX.md)
- [PRICING-STRATEGY.md](./PRICING-STRATEGY.md)
