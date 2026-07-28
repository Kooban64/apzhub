# APZHUB Commercial Product Release Lifecycle

> **Programme:** APZHUB-PRODUCT-MANAGEMENT-001  
> **Classification:** DOCUMENTATION ONLY  
> **Complements:** [PRODUCT-RELEASE-STANDARD](../products/PRODUCT-RELEASE-STANDARD.md) · [RELEASE-GOVERNANCE-CHECKLIST](../releases/RELEASE-GOVERNANCE-CHECKLIST.md)  
> **Date:** 2026-07-19

---

## Purpose

Describe commercial stages of a **product release** (what customers experience and what GTM may claim), layered on engineering SemVer governance.

---

## Stages

| Stage                 | Commercial meaning       | Engineering alignment              |
| --------------------- | ------------------------ | ---------------------------------- |
| **Concept**           | Theme only               | No programme                       |
| **Planning**          | Scope & edition impact   | Definition / readiness docs        |
| **Implementation**    | Build under Approval     | Named programme                    |
| **Beta**              | Limited logos / internal | Pre-cert / soft launch             |
| **Release Candidate** | Packaging freeze         | Evidence pack assembled            |
| **Production**        | GA claim allowed         | Owner Acceptance + register update |
| **Maintenance**       | Patches / limited minors | Patch line naming                  |
| **Retirement**        | EOL of SemVer line       | Migration notice                   |

---

## SemVer commercial mapping

| SemVer class      | Commercial expectation                             |
| ----------------- | -------------------------------------------------- |
| **Patch** (x.y.Z) | Fix / limitation burn-down; no edition leap        |
| **Minor** (x.Y.0) | Additive capabilities within edition story         |
| **Major** (X.0.0) | Possible edition reset / breaking UX; GTM re-brief |

Naming only until Owner Approval ([PORTFOLIO-RELEASE-REGISTER](../releases/PORTFOLIO-RELEASE-REGISTER.md)).

---

## Commercial release checklist (additive)

In addition to engineering [RELEASE-GOVERNANCE-CHECKLIST](../releases/RELEASE-GOVERNANCE-CHECKLIST.md):

1. Edition matrix impact reviewed
2. Licensing model unchanged or Owner-approved change noted
3. Persona / journey messaging updated if needed
4. Known limitations reflected in GTM claims
5. Competitor claims not overstated
6. No numeric prices committed in-repo

---

## Current Production baselines

| Product      | Production SemVer |
| ------------ | ----------------- |
| APZ Projects | **1.1.0**         |
| APZ Time     | **1.0.0**         |
| APZ Support  | **1.0.0**         |

---

## Related

- [PRODUCT-LIFECYCLE.md](./PRODUCT-LIFECYCLE.md)
- [ROADMAP-MANAGEMENT.md](./ROADMAP-MANAGEMENT.md)
- [docs/releases/](../releases/README.md)
