# Product Backlog Standard

> **Programme:** APZHUB-PRODUCTS-000  
> **Related:** [ACTIVE-BACKLOG](../foundation/ACTIVE-BACKLOG.md) · [PRODUCT-LIFECYCLE](./PRODUCT-LIFECYCLE.md)

---

## Purpose

Standardise how product work is captured without inventing platform programme IDs or conflicting with Knowledge Foundation backlog indexes.

---

## Authority

| Layer                          | Document                                                |
| ------------------------------ | ------------------------------------------------------- |
| Platform / cross-product index | [ACTIVE-BACKLOG](../foundation/ACTIVE-BACKLOG.md)       |
| Where work stops               | [CURRENT-MILESTONE](../foundation/CURRENT-MILESTONE.md) |
| Product-local backlog          | `{portfolio}/BACKLOG.md`                                |

Product `BACKLOG.md` files **detail** product stories. They do **not** override CURRENT-MILESTONE authorisation.

---

## Every product BACKLOG.md must include

1. **Product** name and portfolio path
2. **Status** (Idea / Vision / Approved programme / In progress / Closed)
3. **Authorised programme ID** (only when Owner-approved — never invent)
4. **Business value** summary
5. **Platform dependencies** (packages / freezes / SoRs)
6. **ADR dependencies**
7. **Stories / epics** with acceptance criteria
8. **Out of scope**
9. **Stop condition**

---

## Story shape (minimum)

| Field                | Required                                           |
| -------------------- | -------------------------------------------------- |
| ID                   | Product-local or Owner-approved programme story ID |
| Title                | Clear outcome                                      |
| Business value       | Why                                                |
| Acceptance criteria  | Testable                                           |
| Platform touchpoints | Services / connectors / events                     |
| Tests                | Unit / integration / E2E as applicable             |

---

## Rules

- Do **not** invent milestone or programme numbers.
- Do **not** start stories marked Planned/Recommended without Owner Approval.
- Prefer product stories that consume existing Platform Services.
- Platform enhancement stories must be marked **exceptional** and tied to a product blocker or ADR.
