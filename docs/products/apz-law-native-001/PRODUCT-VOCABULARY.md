# APZ Law — Product Vocabulary (Identity Law)

| Field     | Value                                                                            |
| --------- | -------------------------------------------------------------------------------- |
| Programme | APZ-LAW-NATIVE-001                                                               |
| Status    | **IN FORCE**                                                                     |
| Timestamp | 20260805T201500Z                                                                 |
| Authority | [PRODUCT-BOARD-GOVERNANCE-COMPANION.md](./PRODUCT-BOARD-GOVERNANCE-COMPANION.md) |

## Rule

User-facing APZ Law **identity** uses **policy · obligation · compliance · governance · evidence · retention** language.

Product identity: **Governance Companion** — governance supporting work.

Practice-management surfaces (matters, clients, trust, billing, firm operations) may exist below the product boundary for authorised operators. They must not define the default product identity or Activity Bar metaphor.

## N-02 enforcement

Default Tenant Member identity reaches the product via `law.view` only.  
**Practice / firm-admin** surfaces require `law.admin` (or explicit elevated `legal.*` grants on Law Operator).  
Tenant Member must **not** inherit Law Operator (`legal.*` / `trust.*`).

## N-03 enforcement

Primary entry is governance-first Home (`/workspace/law/home`) with GQ-01…GQ-05, Enterprise Governance Catalogue, Help, Settings, and Governance in Context experience model.  
Practice surfaces remain secondary (`law.admin`). Consumer product wiring remains future integration work.

## N-04 permanent identity

APZ Law is **APZHUB-internal governance only** — never a legal practice / case / law-firm / commercial legal SaaS product.  
See [../apzlaw/PRODUCT-BOARD-APZHUB-INTERNAL-GOVERNANCE.md](../apzlaw/PRODUCT-BOARD-APZHUB-INTERNAL-GOVERNANCE.md).
