# Internal Support Model

| Field     | Value              |
| --------- | ------------------ |
| Programme | APZHUB-OPERATE-001 |
| Status    | **IN FORCE**       |

## Purpose

Give APZOR staff a clear place to get help using APZHUB—without opening engine tickets outside the platform when the Support product is available.

## Channels

| Priority | Channel                       | Use for                                    |
| -------- | ----------------------------- | ------------------------------------------ |
| 1        | **APZ Support** (in APZHUB)   | Access, how-to, defects, enablement issues |
| 2        | Named Platform Administrator  | Identity / permission / outage             |
| 3        | Product Owner (named product) | Scope / “should this exist?” — not how-to  |

Do not direct end users to Plane, Zammad, or Kimai consoles for APZHUB usage help.

## Classification

| Ticket type | Meaning                                       | Typical owner                                     |
| ----------- | --------------------------------------------- | ------------------------------------------------- |
| Access      | Cannot sign in / missing product / wrong role | Administrator                                     |
| How-to      | User does not know where to act               | Support + handbook                                |
| Defect      | Platform / product behaves incorrectly        | Product + engineering via APZQEP if change needed |
| Friction    | Works but hurts — candidate learning          | Capture in learning register; **no auto-build**   |
| Feature ask | Wants new capability                          | Product Board — default observe                   |

## Friction vs defect

| Signal                                 | Response                                                                          |
| -------------------------------------- | --------------------------------------------------------------------------------- |
| Broken / blocked                       | Defect — fix under APZQEP if authorised                                           |
| Annoying / unclear                     | Friction — record for My Work Review / Portfolio Review                           |
| Missing product for another department | Enablement — [PRODUCT-ENABLEMENT-CHECKLIST.md](./PRODUCT-ENABLEMENT-CHECKLIST.md) |
| Missing portfolio capability           | Evidence only until Portfolio Review invests                                      |

## SLAs (internal — starting defaults)

| Class                | First response         | Target                        |
| -------------------- | ---------------------- | ----------------------------- |
| Outage / cannot work | Same business day      | Restore or workaround         |
| Access               | 1 business day         | Enable or explain             |
| How-to               | 2 business days        | Resolve with handbook link    |
| Defect               | 2 business days triage | Quality Flow if change needed |

Adjust after 30 days of real load—do not invent a tooling programme to hold SLAs.

## Knowledge base (minimum)

- [INTERNAL-OPERATIONS-HANDBOOK.md](./INTERNAL-OPERATIONS-HANDBOOK.md)
- [INTERNAL-USER-ONBOARDING.md](./INTERNAL-USER-ONBOARDING.md)
- Product help surfaces inside each native product
