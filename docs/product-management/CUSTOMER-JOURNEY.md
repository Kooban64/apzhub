# APZHUB Customer Journey

> **Programme:** APZHUB-PRODUCT-MANAGEMENT-001  
> **Classification:** DOCUMENTATION ONLY  
> **Personas:** [PERSONA-CATALOGUE.md](./PERSONA-CATALOGUE.md)  
> **Date:** 2026-07-19

---

## Purpose

Describe the end-to-end commercial customer journey for APZHUB suite and Law Platform buyers. Not a UX wireframe.

---

## Journey stages

| Stage                | Customer goal                    | APZHUB touchpoints                                     |
| -------------------- | -------------------------------- | ------------------------------------------------------ |
| **Discover**         | Understand APZHUB vs tool sprawl | Website / partner / GTM narrative                      |
| **Evaluate**         | Prove fit for suite or Law       | Community / pilot self-hosted; Definition packs; demos |
| **Procure**          | License & edition decision       | Commercial / Partner terms (out of band)               |
| **Deploy**           | Stand up platform + products     | Docker / ENVIRONMENT coexistence; provisioning         |
| **Onboard**          | First productive workflows       | Workbench Home · product modules · IAM roles           |
| **Adopt**            | Daily use across modules         | Projects / Time / Support / Documents / Law            |
| **Expand**           | Add modules / editions           | Edition ladder; Analytics / Workflow later             |
| **Renew / Advocate** | Continue & refer                 | Support quality · KPIs · partner success               |

---

## Suite path (productivity)

```text
Discover suite → Evaluate Community (Projects/Time/Support)
  → Procure Professional/Enterprise → Deploy self-hosted
  → Onboard IAM → Adopt modules → Expand Documents/Workflow
```

Evidence today: Projects **1.1.0**, Time **1.0.0**, Support **1.0.0** Production baselines.

---

## Law Platform path (primary vertical)

```text
Discover legal practice platform → Evaluate Law validation
  → Procure Law commercial pack → Deploy → Onboard matters/clients
  → Adopt Documents/Time adjacency → Expand suite modules
```

Maturity today: **In Development** / product validation — not Portfolio Production SemVer trio.

---

## Moments of truth

| Moment                             | Risk if failed                   | Mitigation (framework)                   |
| ---------------------------------- | -------------------------------- | ---------------------------------------- |
| First login                        | Confusion / engine branding leak | Brand mask · Workbench shell             |
| First project / ticket / timesheet | Incomplete value                 | Certified vertical slices only           |
| First upgrade                      | Breakage                         | Release governance checklist             |
| Support incident                   | Churn                            | Support KPIs · known limitations honesty |

---

## Related

- [GO-TO-MARKET.md](./GO-TO-MARKET.md)
- [PERSONA-CATALOGUE.md](./PERSONA-CATALOGUE.md)
- [PRODUCT-KPI-CATALOGUE.md](./PRODUCT-KPI-CATALOGUE.md)
