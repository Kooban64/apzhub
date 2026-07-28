# APZHUB Operational Transition

> **Programme:** APZHUB-OWNER-001  
> **Classification:** DOCUMENTATION ONLY  
> **Date:** 2026-07-19  
> **Status:** **ACCEPTED / CLOSED** — Operational Delivery **ACTIVE**  
> **Closure:** [FOUNDATION-CLOSURE.md](./FOUNDATION-CLOSURE.md)

---

## New repository state

**Operational Delivery**

QA-002 certification **PRODUCTION READY** is retained.  
Architecture remains **Frozen** where declared.  
Foundation is **Closed**.

---

## Canonical lifecycle (governance)

```text
Foundation
        ↓
Engineering
        ↓
Product Management
        ↓
Operational Delivery
        ↓
Release Management
        ↓
Certification
        ↓
Production
```

| Stage                | Meaning                                         | Repository posture                                       |
| -------------------- | ----------------------------------------------- | -------------------------------------------------------- |
| Foundation           | Platform, KF, standards, catalogues             | **CLOSED**                                               |
| Engineering          | Operating model, product engineering capability | **ACTIVE** (operate)                                     |
| Product Management   | Commercial PM framework                         | **Operational**                                          |
| Operational Delivery | Day-to-day delivery under Owner Approval        | **ACTIVE** (current)                                     |
| Release Management   | SemVer packaging & release gates                | **Operational**                                          |
| Certification        | Quality / vertical / product cert               | **Operational**                                          |
| Production           | Owner-accepted SemVer baselines                 | **ACTIVE** (Projects 1.1.0 · Time 1.0.0 · Support 1.0.0) |

---

## How future work is initiated

Future programmes shall be initiated by one or more of:

1. **Business Priority**
2. **Product Roadmap** ([COMMERCIAL-ROADMAP](../product-management/COMMERCIAL-ROADMAP.md) · [PRODUCT-PORTFOLIO](../products/APZHUB-PRODUCT-PORTFOLIO.md))
3. **Customer Requirement**
4. **Strategic Initiative**

Every delivery still requires a **named Owner Approval**.  
No Foundation programmes unless Owner explicitly approves.

---

## What stops

| Stop                                                   | Rule                                |
| ------------------------------------------------------ | ----------------------------------- |
| Foundation programmes                                  | Do not create unless Owner-approved |
| Implied “still building foundation” language           | Prefer Operational Delivery         |
| Unapproved Patch / Minor / Major                       | Forbidden                           |
| Unapproved product / integration / architecture change | Forbidden                           |

---

## Production baselines (unchanged by transition)

| Product      | SemVer    |
| ------------ | --------- |
| APZ Projects | **1.1.0** |
| APZ Time     | **1.0.0** |
| APZ Support  | **1.0.0** |

---

## Related

- [OWNER-ACCEPTANCE-REGISTER.md](./OWNER-ACCEPTANCE-REGISTER.md)
- [CURRENT-MILESTONE.md](./CURRENT-MILESTONE.md)
- [AI-MANIFEST.md](./AI-MANIFEST.md)
