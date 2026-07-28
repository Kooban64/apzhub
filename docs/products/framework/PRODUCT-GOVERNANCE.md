# Product Governance

> **Programme:** APZHUB-PRODUCTS-002 · Baseline: Platform 1.4

## Governance chain

```text
Owner Decision
  → Product Architecture Standard
  → Product ADR (if required)
  → Product Engineering Standard
  → Named Engineering Programme
  → Operational Readiness
  → Product Certification
  → Release Management
  → Maintenance
  → End-of-Life
```

## Standards (binding after Acceptance of this programme)

| Standard                      | Document                                                                 |
| ----------------------------- | ------------------------------------------------------------------------ |
| Product Architecture Standard | [PRODUCT-ARCHITECTURE-STANDARD.md](./PRODUCT-ARCHITECTURE-STANDARD.md)   |
| Product ADR Standard          | § in Architecture Standard                                               |
| Product Engineering Standard  | [PRODUCT-ENGINEERING-STANDARD.md](./PRODUCT-ENGINEERING-STANDARD.md)     |
| Operational Readiness         | Product OR packs (mirror Platform OR pattern)                            |
| Product Certification         | [PRODUCT-CERTIFICATION-STANDARD.md](./PRODUCT-CERTIFICATION-STANDARD.md) |
| Release Management            | SemVer evidence under `docs/releases/{product}/` + Owner Acceptance      |
| Maintenance                   | Patch/Minor/Major only via new named Approvals                           |
| End-of-Life                   | Explicit Owner EOL programme                                             |

## Programme naming

| Pattern               | Use                                      |
| --------------------- | ---------------------------------------- |
| `APZ-{PRODUCT}-00N`   | Product-specific programmes              |
| `APZHUB-PRODUCTS-00N` | Cross-product framework / portfolio      |
| `Platform-*`          | Platform only — **not** for product work |

Do not invent programme IDs. Owner assigns / authorises IDs.

## Documentation standards (every product)

Minimum living docs under `docs/products/{id}/` (or established pack path):

- README · VISION · ARCHITECTURE · FEATURE-CATALOGUE (or CAPABILITIES)
- INTEGRATIONS · TESTING-STRATEGY · OPERATIONAL-READINESS
- CERTIFICATION-STRATEGY · KNOWN-LIMITATIONS · RELEASES · ROADMAP

## Platform boundary (hard)

| Allowed in product programmes                        | Forbidden in product programmes     |
| ---------------------------------------------------- | ----------------------------------- |
| Product modules, services (product domain), adapters | Platform redesign                   |
| Product docs / tests / evidence                      | Platform 2.0                        |
| Consuming Platform 1.4 APIs                          | Enabling durable runtime by default |
| Product ADRs                                         | Silent Platform freeze breaks       |

## Registers

- [OWNER-ACCEPTANCE-REGISTER](../../foundation/OWNER-ACCEPTANCE-REGISTER.md)
- [CURRENT-MILESTONE](../../foundation/CURRENT-MILESTONE.md)
- [ACTIVE-BACKLOG](../../foundation/ACTIVE-BACKLOG.md)
- Evidence under `docs/operations/evidence/` or `docs/releases/` as applicable
