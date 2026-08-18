# OWNER DIRECTIVE — Commercial Pricing Decision Gate

> **Status:** **IN FORCE**  
> **Date:** 2026-08-18  
> **Authority:** Owner  
> **Engineering:** **STOPPED** — no further commerce / pricing / UX / product programmes until Price Book v1.0 is supplied

---

## Acceptance

Commercial Pricing Administration is **ACCEPTED AND COMPLETE**.

Engineering remains stopped.

Do not implement additional commerce, UX, pricing, billing, catalogue, APZPRD, APZQEP, APZPEN, IAM, Source, Marketplace or Platform Admin functionality.

The next required input is the **Owner-approved APZ Commercial Price Book v1.0**.

---

## Locked commercial model

```text
GLOBAL
Currency: USD
Purpose: International list price

AFRICA
Currency: USD
Purpose: Preferential African pricing
Rule: Product-specific pricing — NOT a blanket percentage discount

SOUTH AFRICA
Currency: ZAR
Purpose: Fixed domestic price book
Rule: Deliberately priced — NOT derived from USD/ZAR FX
```

### Locked commercial principles

```text
APZ Platform
Included with any purchased APZ discipline.
No separate launch platform fee.

APZPRD
Modular commercial model.

APZQEP
Quality-engineering commercial model.
Engineer and Collaborator pricing may differ.

APZPEN
Specialist security commercial model.
Practitioner and Collaborator pricing may differ.

Professional penetration-testing services
NOT included in APZPEN SaaS pricing.

Professional Tools
Independently entitled.

Source Workspace
Independently entitled.

Organisation subscription
DOES NOT automatically grant users access.
```

---

## Pricing control

Final prices will be entered by the Owner through:

```text
Platform Admin
→ Billing
→ Pricing
→ Draft
→ Preview
→ Publish
```

No final prices are to be:

- hard-coded;
- seeded;
- inferred;
- calculated from competitor prices;
- calculated from foreign exchange rates;
- added to migrations;
- added to environment variables.

`Unset` remains the correct state until the Owner publishes the price book.

### South Africa

Pricing will be published exclusive of VAT.

The existing tax control plane will apply the Owner-approved South African VAT rule when activated.

Do not activate or alter the tax rule without Owner instruction.

### PayFast

Production credentials remain configuration/secrets.

Do not configure, fabricate or expose credentials.

Payment activation continues to require verified server-side PayFast state/ITN.

Browser return must never constitute payment success.

### Self-service registration

Remains Owner-controlled.

Do not enable it merely to complete commercial readiness.

---

## Current status

```text
PLATFORM ENGINEERING
COMPLETE FOR CURRENT SCOPE

COMMERCE FLOW
CERTIFIED

COMMERCIAL PRICING ADMINISTRATION
COMPLETE

PRICE BOOK
OWNER DECISION PENDING

PAYFAST PRODUCTION
CONFIGURATION PENDING

SELF-SERVICE REGISTRATION
OWNER DECISION PENDING

OVERALL
PRODUCTION CONFIGURATION PENDING
```

---

## Next authorised action

**None.**

Wait for the Owner to provide **APZ Commercial Price Book v1.0** containing approved values for:

```text
APZPRD
├── Projects
├── Support
├── Time
├── Workflow
├── Analytics
├── Knowledge
├── Documents
└── Complete

APZQEP
├── Engineer
└── Collaborator

APZPEN
├── Practitioner
└── Collaborator

GLOBAL USD
AFRICA USD
SOUTH AFRICA ZAR

Monthly pricing
Annual pricing
Trial policy
Minimum-seat policy
Enterprise / Contact Sales rules
```

When that Price Book is supplied, **do not redesign the pricing system**.

Expected next operation:

```text
Owner price book
      ↓
validate catalogue mapping
      ↓
enter as DRAFT
      ↓
Owner review
      ↓
PUBLISH
      ↓
commerce sandbox recertification
      ↓
PayFast production configuration
      ↓
production activation
```

**STOP. Do not start another programme.**
