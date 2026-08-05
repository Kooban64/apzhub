# APZHUB Product Adoption Playbook

| Field     | Value                                                                                              |
| --------- | -------------------------------------------------------------------------------------------------- |
| Status    | **GOVERNING — ENGINEERING STANDARD**                                                               |
| Timestamp | 20260805T051000Z                                                                                   |
| Maturity  | Operationally validated — [METHODOLOGY-MATURITY](./APZHUB-NATIVE-ADOPTION-METHODOLOGY-MATURITY.md) |
| Reference | APZ Time — **RI #001** · APZ Support — **RI #002**                                                 |
| Companion | [APZHUB-PRODUCT-NATIVE-ADOPTION-STANDARD.md](./APZHUB-PRODUCT-NATIVE-ADOPTION-STANDARD.md)         |

> **The Playbook changes only when operational evidence demonstrates that it should.**

## Purpose

Reusable handbook for onboarding an integrated engine as a **native APZHUB product**.

Copy the **process**, not APZ Time code.

Applies to: APZ Projects · APZ Support · APZ Documents · APZ Analytics · APZ Workflow · APZ Law Platform · future products.

## Prerequisites before adoption

| Prerequisite                                                               | Why                                      |
| -------------------------------------------------------------------------- | ---------------------------------------- |
| **PRODUCT-000 Mission Owner-APPROVED**                                     | Purpose before engineering               |
| Product exists in production (or accepted baseline) with known limitations | Adoption ≠ greenfield creation           |
| Certified / accepted adapter (or equivalent integration contract)          | Implementation detail must be governable |
| APZQEP Enterprise Quality Baseline in force                                | Quality path already exists              |
| Owner Authorisation for a named Native Adoption programme                  | No silent product programmes             |
| Honest Known Limitations documented                                        | Prevent feature-parity chasing           |

Lifecycle: see [APZHUB-WORKING-MODEL.md](./APZHUB-WORKING-MODEL.md).

## Adoption sequence (N-01…N-04)

| Phase    | Title                                                        | Engineering?            | Exit                                                                                 |
| -------- | ------------------------------------------------------------ | ----------------------- | ------------------------------------------------------------------------------------ |
| **N-01** | Native UX Audit                                              | Analysis only           | Gap register; Critical leaks identified                                              |
| **N-02** | Identity Convergence                                         | Yes (identity only)     | Single APZHUB identity; no engine auth/roles                                         |
| **N-03** | Native Workspace Experience (Product Experience Convergence) | Yes (presentation only) | Native chrome/nav; product feels/behaves/speaks as APZHUB; no engine/adapter leakage |
| **N-04** | Operational Quality Adoption                                 | Process/docs only       | Every change via APZQEP; checklists in force                                         |

Do not reorder. Do not skip. Do not pull Phase C features forward without evidence.

## Governance checkpoints

| Checkpoint                        | Authority                                             |
| --------------------------------- | ----------------------------------------------------- |
| Programme open                    | Owner Authorisation                                   |
| Each N-0x slice open              | Owner Authorisation                                   |
| Architecture change               | Product Board + ADR (normally refuse during adoption) |
| Feature expansion beyond baseline | Separate Owner Auth / named release                   |
| Declare “APZHUB Native”           | N-01…N-04 complete + operational pack in force        |

## APZQEP integration points

Every post-adoption change must:

1. Open a Quality Flow
2. Classify change / identify components
3. Evaluate impact and policies
4. Produce Decision Package
5. Capture Evidence
6. Complete Engineering / Quality / Release checklists
7. Record Operational Learning on completed releases

Reference ops packs: Time [../apztime/](../apztime/) · Support [../apzsupport/](../apzsupport/)  
Emerging Portfolio Patterns: [APZHUB-EMERGING-PORTFOLIO-PATTERNS.md](./APZHUB-EMERGING-PORTFOLIO-PATTERNS.md)

## Exit criteria — “APZHUB Native”

A product may be declared **APZHUB Native** when:

| Criterion                                                      | Met? |
| -------------------------------------------------------------- | ---- |
| N-01 gap register complete                                     |      |
| N-02 single platform identity                                  |      |
| N-03 product experience convergence; no engine/adapter leakage |      |
| N-04 operational pack in force                                 |      |
| APZQEP is the only quality/release path                        |      |
| Known Limitations remain honest                                |      |
| Reference evidence committed                                   |      |

## Common pitfalls (from APZ Time)

| Pitfall                                             | Avoidance                                       |
| --------------------------------------------------- | ----------------------------------------------- |
| Treating adoption as “build the product”            | Baseline already exists — mature the experience |
| Measuring Kimai/Plane/etc. feature parity           | Measure APZHUB experience and daily use         |
| Hardcoding product permissions in UI                | Consume session / PermissionService             |
| Leaving ops JSON / connection tests in end-user nav | Admin-gate; product framing                     |
| Starting the next product before exercising APZQEP  | Let real releases prove the standards           |
| Writing more standards before evidence              | Prefer Operational Learning over new policy     |

## After declaration

Stop designing. Operate.

1. Complete the [RI Retrospective](./APZHUB-RI-RETROSPECTIVE.md).
2. Next milestone for that product is not more methodology — it is:

> We fixed a defect / shipped a change using APZQEP.

3. Next product programme opens only when **business priority** says so.

Promote patterns from Learning Registers / Emerging Portfolio Patterns before inventing new standards. Do not change this Playbook from preference.
