# APZHUB Portfolio Engineering — Governance Model

| Field     | Value                                                                  |
| --------- | ---------------------------------------------------------------------- |
| Document  | PORTFOLIO-GOVERNANCE-MODEL                                             |
| Programme | APZHUB-ENG-002                                                         |
| Phase     | 0                                                                      |
| Status    | DRAFT — with Charter                                                   |
| Parent    | [PORTFOLIO-ENGINEERING-CHARTER.md](./PORTFOLIO-ENGINEERING-CHARTER.md) |

---

## 1. Purpose

Define how enterprise engineering standards are decided, changed, and consumed—without embedding engineering content in governance.

---

## 2. Decision rights

| Decision                              | Authority                                                      | Evidence                         |
| ------------------------------------- | -------------------------------------------------------------- | -------------------------------- |
| Authorise APZHUB-ENG-002 phases       | Owner                                                          | Owner instruction                |
| Certify Portfolio Engineering Charter | Product Board                                                  | Board decision record            |
| Approve promotion of a standard       | Product Board                                                  | Promotion pack + Board CERTIFIED |
| Architectural fitness of promotion    | Architecture Board                                             | Architecture review note         |
| Normative revision of Active standard | Product Board (or Owner-delegated change control)              | Version bump + changelog         |
| Deprecate / supersede / retire        | Product Board                                                  | Lifecycle record                 |
| Product KEEP PRODUCT specialisation   | Product Owner within Charter scope                             | Product framework citation       |
| Release / GA / deploy                 | Lifecycle / Release authority — **never** implied by promotion | Separate programme               |

---

## 3. Conflict resolution

Apply Charter §5 hierarchy. If unresolvable within authorised scope: **STOP** and escalate to Owner / Product Board.

---

## 4. Dual-authority prohibition

For any single concern (e.g. slice process, portfolio test levels, portfolio certification vocabulary), exactly one enterprise authority SHALL exist after promotion.

Products MAY:

- cite the enterprise standard;
- add product addenda that **tighten** rules;
- keep product-only concerns under KEEP PRODUCT.

Products MUST NOT:

- fork a competing enterprise rule;
- weaken enterprise default-deny / isolation rules by “local exception” without Board/Owner authority.

---

## 5. Consumption model

```text
Enterprise Standard (Active, versioned)
        │
        ▼
Product Framework cites: "Inherits APZHUB <Standard> vX"
        │
        ▼
Slice Specifications inherit via Framework citation
        │
        ▼
Implementation
```

Silent non-citation of a mandatory Active enterprise standard is a governance defect.

---

## 6. Relationship to APZHUB-ENG-001

APZHUB-ENG-001 (slice process) remains **IN FORCE / FROZEN**. This programme promotes complementary portfolio standards; it does not unfreeze ENG-001 without ADR/Owner path.

---

## 7. AI agents

AI engineering agents SHALL read this Charter and Active enterprise standards before inventing process. They SHALL NOT promote standards or expand Owner authority.
