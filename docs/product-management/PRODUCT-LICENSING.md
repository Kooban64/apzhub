# APZHUB Product Licensing Models

> **Programme:** APZHUB-PRODUCT-MANAGEMENT-001  
> **Classification:** DOCUMENTATION ONLY — no enforcement  
> **Date:** 2026-07-19

---

## Purpose

Document licensing **models** available to APZHUB commercial packaging. Does not publish license keys, SKUs, or enforcement design.

---

## Licensing models

| Model           | Definition                                                                                             | Use with                                                |
| --------------- | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------- |
| **Open Source** | Customer runs CE OSS engines under their upstream licenses; APZHUB platform/modules under APZHUB terms | Community; evaluation                                   |
| **Commercial**  | Paid rights to APZHUB product modules, support, and editions beyond Community                          | Professional / Enterprise / Government / Partner        |
| **Hosted SaaS** | APZHUB (or partner) operates the runtime for the customer                                              | Future hosted offering — not a current Production claim |
| **Self Hosted** | Customer (or their MSP) operates APZHUB on their infrastructure                                        | Default commercial posture (004 self-hosted first)      |
| **Hybrid**      | Mix of self-hosted engines/data with hosted control plane or vice versa                                | Enterprise / Government options                         |

---

## Separation of concerns

| Layer                                     | License concern                                             |
| ----------------------------------------- | ----------------------------------------------------------- |
| Backend engines (Plane, Kimai, Zammad, …) | Upstream OSS CE licenses — customer/operator responsibility |
| APZHUB platform & product modules         | APZHUB commercial / OSS terms (Owner-defined)               |
| OEM / Partner                             | Additional redistribution rights                            |

Never imply that APZHUB Ownership of upstream engines.

---

## Deployment × license matrix (framework)

|              | Open Source   | Commercial       | Hosted SaaS     | Self Hosted | Hybrid        |
| ------------ | ------------- | ---------------- | --------------- | ----------- | ------------- |
| Community    | Primary       | Optional support | Optional future | Primary     | Rare          |
| Professional | Engines CE    | Primary          | Optional        | Primary     | Optional      |
| Enterprise   | Engines CE    | Primary          | Optional        | Primary     | Common option |
| Government   | Engines CE    | Primary          | Restricted      | Primary     | Common option |
| OEM          | As contracted | Primary          | Rare            | Common      | As contracted |
| Partner      | As contracted | Primary          | Possible        | Common      | Possible      |

---

## Rules

1. No licensing enforcement code in this programme.
2. No secret keys or commercial contracts in the repository.
3. Self-hosted remains the documented default until Owner authorises a Hosted SaaS product programme.
4. Law Platform commercial packaging may use Commercial + Self Hosted / Hybrid first.

---

## Related

- [PRODUCT-EDITIONS.md](./PRODUCT-EDITIONS.md)
- [PRICING-STRATEGY.md](./PRICING-STRATEGY.md)
- [GO-TO-MARKET.md](./GO-TO-MARKET.md)
