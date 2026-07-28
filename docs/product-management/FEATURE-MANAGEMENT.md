# APZHUB Feature Management

> **Programme:** APZHUB-PRODUCT-MANAGEMENT-001  
> **Classification:** DOCUMENTATION ONLY  
> **Date:** 2026-07-19

---

## Purpose

Govern how product features are proposed, classified, edition-bound, and released — without inventing engineering programme IDs.

---

## Feature states

| State               | Meaning                                     |
| ------------------- | ------------------------------------------- |
| Idea                | Uncommitted suggestion                      |
| Candidate           | Prioritised for planning                    |
| Planned             | On commercial roadmap                       |
| In Delivery         | Owner-approved engineering programme active |
| Certified           | Meets certification / PRWL gates            |
| Generally Available | In Production edition claims                |
| Deprecated          | Scheduled for removal                       |
| Retired             | Removed from editions                       |

---

## Classification

| Class                     | Rule                                                          |
| ------------------------- | ------------------------------------------------------------- |
| **Core**                  | Required for named edition baseline                           |
| **Differentiator**        | Professional+ or Enterprise step-up                           |
| **Vertical**              | Law-specific or industry pack                                 |
| **Platform-shared**       | Delivered once; consumed by many products (Search, Notify, …) |
| **Integration-dependent** | Requires certified adapter capability                         |
| **Non-goal**              | Explicitly excluded (must appear in KNOWN-LIMITATIONS)        |

---

## Edition binding

Every GA feature must declare:

1. Minimum edition (Community / Professional / …)
2. Products affected
3. Dependencies (platform service, adapter)
4. Limitation register entry if PRWL

See [PRODUCT-EDITION-MATRIX.md](./PRODUCT-EDITION-MATRIX.md).

---

## Intake path

```text
Idea → Candidate (Product Owner)
     → Planned (Portfolio / commercial review)
     → Owner Approval (engineering programme)
     → In Delivery → Certified → GA
```

Cross-product features follow [PORTFOLIO-INTEGRATION-STRATEGY](../products/PORTFOLIO-INTEGRATION-STRATEGY.md) (PORTFOLIO-001 **Operational**).

---

## Rules

1. Modules never ship business logic around licensing — commercial entitlement is a future platform concern.
2. Engine-specific features are described in APZHUB product language.
3. Frozen architecture waves cannot be expanded by feature request alone (ADR + Owner).

---

## Related

- [ROADMAP-MANAGEMENT.md](./ROADMAP-MANAGEMENT.md)
- [PRODUCT-LIFECYCLE.md](./PRODUCT-LIFECYCLE.md)
- [docs/products/PRODUCT-BACKLOG-STANDARD.md](../products/PRODUCT-BACKLOG-STANDARD.md)
