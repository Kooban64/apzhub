# APZHUB Product Native Adoption Standard

| Field     | Value                                                                                              |
| --------- | -------------------------------------------------------------------------------------------------- |
| Standard  | **APZHUB Product Native Adoption Standard**                                                        |
| Status    | **GOVERNING — OPERATIONALLY VALIDATED**                                                            |
| Timestamp | 20260805T051000Z                                                                                   |
| Maturity  | [APZHUB-NATIVE-ADOPTION-METHODOLOGY-MATURITY.md](./APZHUB-NATIVE-ADOPTION-METHODOLOGY-MATURITY.md) |
| Quality   | APZQEP Version 1.1 (mandatory)                                                                     |
| Playbook  | [APZHUB-PRODUCT-ADOPTION-PLAYBOOK.md](./APZHUB-PRODUCT-ADOPTION-PLAYBOOK.md)                       |

## Purpose

Define the repeatable path from **wrapped / integrated application** to
**mature native APZHUB product experience**.

This standard copies the **maturation process**, not product code.

It has been validated across **two independent products** (APZ Time, APZ Support) without requiring redesign. It is the authoritative portfolio adoption methodology. Future changes require operational evidence — not preference.

## Mandatory phases

Every integrated product must complete the following before it is considered a
**mature APZHUB product**:

| Phase    | Title                                                        | Intent                                       |
| -------- | ------------------------------------------------------------ | -------------------------------------------- |
| **N-01** | Native UX Audit                                              | Establish facts without changing the product |
| **N-02** | Identity Convergence                                         | Consume APZHUB identity, session, RBAC only  |
| **N-03** | Native Workspace Experience (Product Experience Convergence) | Indistinguishable APZHUB product experience  |
| **N-04** | Operational Quality Adoption                                 | Every change runs through APZQEP             |

## Phase rules

### N-01 — Native UX Audit

- Analysis only unless a follow-on slice is authorised
- Gap register with severity and feed-forward
- Engine / adapter leakage findings are Critical

### N-02 — Identity Convergence

- No second login
- No engine identities, roles, or permissions exposed
- Product consumes platform identity; never owns it

### N-03 — Native Workspace Experience (Product Experience Convergence)

Purpose: converge **product experience** — every APZHUB product feels the same, behaves the same, speaks the same language, and presents the same quality. Workspace chrome is one part of that outcome; the product experience is the real exit.

- Native layout, navigation, breadcrumbs, empty/loading/error states
- APZHUB terminology and icons only
- No engine terminology, adapter console feeling, or raw JSON for end users
- Help and product settings are APZHUB-owned when introduced
- No Playbook redesign — clarification of intent only

### N-04 — Operational Quality Adoption

- Do not measure features; measure behaviour
- Every change: Quality Flow → Impact → Policy → Decision → Evidence → Learning
- No dual quality process; no engine-native APZHUB release path
- Publish product ops pack (lifecycle, release process, checklists, metrics, learning, roles)
- Reference ops packs: [../apztime/](../apztime/) · [../apzsupport/](../apzsupport/)

## Reference implementations

| RI   | Product     | Path                                                                                           |
| ---- | ----------- | ---------------------------------------------------------------------------------------------- |
| #001 | APZ Time    | [../apztime/REFERENCE-IMPLEMENTATION-001.md](../apztime/REFERENCE-IMPLEMENTATION-001.md)       |
| #002 | APZ Support | [../apzsupport/REFERENCE-IMPLEMENTATION-002.md](../apzsupport/REFERENCE-IMPLEMENTATION-002.md) |

Subsequent products follow the same sequence under separate Owner Authorisation. Sequencing is a **business priority** decision — not a methodology experiment.

After each RI: complete [APZHUB-RI-RETROSPECTIVE.md](./APZHUB-RI-RETROSPECTIVE.md).

## Explicit non-goals

- Engine feature parity as a maturity metric
- Copying Time/Support UI code into other products
- Expanding APZQEP architecture as part of product adoption
- Pulling capability expansion forward without operational evidence
- Changing this standard without multi-product operational evidence

## Relationship

| Framework doc                                                        | Role                                                                                               |
| -------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| [PRODUCT-ENGINEERING-STANDARD.md](./PRODUCT-ENGINEERING-STANDARD.md) | How products are engineered                                                                        |
| [PRODUCT-QUALITY-STANDARD.md](./PRODUCT-QUALITY-STANDARD.md)         | Quality expectations                                                                               |
| **This standard**                                                    | Path from integrated engine to native APZHUB product                                               |
| Methodology maturity                                                 | [APZHUB-NATIVE-ADOPTION-METHODOLOGY-MATURITY.md](./APZHUB-NATIVE-ADOPTION-METHODOLOGY-MATURITY.md) |
| APZQEP-ADOPT-001                                                     | Ongoing operational quality practice                                                               |
