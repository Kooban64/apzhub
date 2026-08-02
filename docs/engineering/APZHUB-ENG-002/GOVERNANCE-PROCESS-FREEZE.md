# Governance Process Freeze

| Field              | Value                                                                                  |
| ------------------ | -------------------------------------------------------------------------------------- |
| Document           | GOVERNANCE-PROCESS-FREEZE                                                              |
| Programme          | APZHUB-ENG-002                                                                         |
| Status             | **NORMATIVE** (permanent)                                                              |
| Authority          | [Portfolio Engineering Charter](./PORTFOLIO-ENGINEERING-CHARTER.md) §14                |
| Governance Version | [APZHUB-ENGINEERING-GOVERNANCE.md](../APZHUB-ENGINEERING-GOVERNANCE.md) **1.0 STABLE** |
| Adopted            | Product Board — 20260802T121905Z                                                       |

---

## Policy text

```text
Governance Process Freeze

The Enterprise Engineering Promotion Lifecycle,
Standards Catalogue,
Enterprise Engineering Baseline,
Dual Approval Rule,
and Stable Baseline Policy

are themselves governed artefacts.

They shall not be modified during ordinary Enterprise Standard promotions.

Changes to the governance process itself require:

• a dedicated Governance Programme,
• Architecture Review,
• Product Board approval,
• and an explicit governance version increment.
```

---

## Intent

The process has been proven. Ordinary promotions (ES-004, ES-005, …) SHALL NOT quietly change how standards are promoted.

| Layer                                                                 | May change during ordinary promotion?  |
| --------------------------------------------------------------------- | -------------------------------------- |
| Active standard **bodies** (via Dual Approval)                        | Yes — under promotion rules            |
| Catalogue **row status / versions**                                   | Yes — inventory updates                |
| Baseline **adopted set + minor version**                              | Yes — when a standard becomes Active   |
| Promotion Lifecycle / Dual Approval / Stable Baseline Policy / Freeze | **No** — Governance Programme required |
| Catalogue / Baseline **model purpose**                                | **No** — Governance Programme required |

---

## Governance vs Baseline versioning

| Version                | Meaning                       |
| ---------------------- | ----------------------------- |
| **Governance Version** | How standards are managed     |
| **Baseline Version**   | Which standards are mandatory |

---

## Related

- [APZHUB-ENGINEERING-GOVERNANCE.md](../APZHUB-ENGINEERING-GOVERNANCE.md)
- [STABLE-BASELINE-POLICY.md](./STABLE-BASELINE-POLICY.md)
- [PROMOTION-PRINCIPLES.md](./PROMOTION-PRINCIPLES.md)
