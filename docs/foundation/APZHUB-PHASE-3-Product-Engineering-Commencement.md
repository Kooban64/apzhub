# APZHUB Phase 3 — Product Engineering Commencement

> **Type:** Owner Directive (documentation)  
> **Date:** 2026-07-18  
> **Status:** IN FORCE  
> **Prerequisite:** [APZHUB-FOUNDATION-001](./APZHUB-FOUNDATION-001-Platform-Foundation-Completion-Report.md) — **ACCEPTED**  
> **AI entry:** [AI-MANIFEST](./AI-MANIFEST.md) · Stop: [CURRENT-MILESTONE](./CURRENT-MILESTONE.md)

---

## Owner Decision

APZHUB Platform Foundation has been reviewed.

**APZHUB-FOUNDATION-001 is ACCEPTED.**

The Platform Foundation phase is officially **CLOSED**.

This marks the transition from **Platform Engineering** to **Product Engineering**.

---

## Engineering Policy

From this point forward:

| Rule                 | Meaning                                          |
| -------------------- | ------------------------------------------------ |
| Platform Foundation  | **COMPLETE** — not the default engineering focus |
| Knowledge Foundation | Authoritative for process and status             |
| Repository state     | Authoritative for what exists                    |
| AI-MANIFEST          | Bootstrap document for all AI agents             |
| Architecture freezes | Remain in force                                  |
| Integration SDK      | Remains **Architecture Frozen** (**1.0.0**)      |
| Platform Services    | Remain the canonical platform API                |

**Platform engineering is no longer the default activity.**

Platform work may occur only when:

1. **Required by a product**, or
2. **Required by operational necessity**, or
3. **Approved through an ADR** (+ Owner where required by freeze rules)

---

## Primary Engineering Objective

Deliver **high-value business products** on top of the Platform.

---

## Product Portfolios

Future engineering is organised into these portfolios:

1. **Projects**
2. **Time**
3. **Support**
4. **Documents**
5. **Analytics**
6. **Workflow**
7. **Law Platform**

Platform capabilities are **enabling work only**.

---

## Programme Governance

Future programmes should be organised around **products**.

Every programme should identify:

- Product
- Business value
- Platform dependencies
- ADR dependencies
- Acceptance criteria

Platform enhancement programmes should be **exceptional**.

---

## Engineering Principle

Preferred order of work:

```text
Product capability
  → Platform extension (only when required)
  → Certification
  → Release
```

---

## Current Authorisation

**No Product Engineering programme is authorised.**

Do not recommend a programme and do not bootstrap implementation until explicit Owner Approval of the first Product Engineering programme.

---

## See also

- [Product Engineering Framework (APZHUB-PRODUCTS-000)](../products/README.md)
- [APZHUB-FOUNDATION-001](./APZHUB-FOUNDATION-001-Platform-Foundation-Completion-Report.md)
- [CURRENT-MILESTONE](./CURRENT-MILESTONE.md)
- [PRODUCT-CATALOGUE](./PRODUCT-CATALOGUE.md)
- [ACTIVE-BACKLOG](./ACTIVE-BACKLOG.md)
