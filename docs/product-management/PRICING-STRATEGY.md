# APZHUB Pricing Strategy (Principles Only)

> **Programme:** APZHUB-PRODUCT-MANAGEMENT-001  
> **Classification:** DOCUMENTATION ONLY  
> **Rule:** **No actual prices** in this repository  
> **Date:** 2026-07-19

---

## Purpose

Define pricing **principles** and packaging levers. Numeric price lists, quotes, and discount schedules are Owner commercial decisions outside this repo.

---

## Principles

1. **Value before volume** — price against outcomes (matter throughput, ticket resolution, utilisation), not engine brand names.
2. **Edition ladders** — Community → Professional → Enterprise → Government clear step-ups in capability and assurance.
3. **Suite + vertical** — suite products (Projects, Time, Support, Documents, Workflow, Analytics) may bundle; Law Platform may price as primary vertical SKU.
4. **Self-hosted fairness** — self-hosted Commercial pricing reflects software + support, not mandatory cloud margin.
5. **Transparent limitations** — PRWL products must price with documented capability boundaries.
6. **Partner economics** — Partner / OEM editions use margin-compatible packaging (terms out of band).
7. **No shadow SKUs** — every sellable unit maps to an edition + product in the [PRODUCT-EDITION-MATRIX](./PRODUCT-EDITION-MATRIX.md).

---

## Pricing dimensions (levers)

| Lever                 | Description                                                        | Notes                                  |
| --------------------- | ------------------------------------------------------------------ | -------------------------------------- |
| Edition               | Community / Professional / Enterprise / Government / OEM / Partner | Primary ladder                         |
| Seat / named user     | Optional for Professional+                                         | Not mandated here                      |
| Organisation / tenant | Multi-org Enterprise                                               | Aligns with platform tenancy readiness |
| Module add-ons        | e.g. Analytics, TCMS, Workflow execute (future)                    | Only when certified                    |
| Support tier          | Standard / Premium / Mission-critical                              | Commercial ops                         |
| Deployment            | Self-hosted vs Hosted SaaS vs Hybrid                               | Hosted premium only if offering exists |
| Vertical pack         | Law Platform pack                                                  | Primary commercial offering            |

---

## Explicitly out of scope

- Currency amounts, list prices, MSRP
- Discount matrices
- Billing system design
- Entitlement metering implementation

---

## Governance

| Change                  | Requires                                    |
| ----------------------- | ------------------------------------------- |
| New pricing principle   | Update this doc + Owner Acceptance          |
| Publish numeric prices  | Owner commercial decision (may be external) |
| New SKU / edition price | Edition matrix + Owner Approval             |

---

## Related

- [PRODUCT-EDITIONS.md](./PRODUCT-EDITIONS.md)
- [PRODUCT-LICENSING.md](./PRODUCT-LICENSING.md)
- [COMMERCIAL-PRODUCT-CATALOGUE.md](./COMMERCIAL-PRODUCT-CATALOGUE.md)
