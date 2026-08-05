# APZHUB Product Native Adoption Standard

| Field     | Value                                                                        |
| --------- | ---------------------------------------------------------------------------- |
| Standard  | **APZHUB Product Native Adoption Standard**                                  |
| Status    | **GOVERNING** (Owner-directed from TIME-NATIVE-001)                          |
| Timestamp | 20260805T034500Z                                                             |
| Reference | TIME-NATIVE-001 Phase A (APZ Time) — **COMPLETE**                            |
| Quality   | APZQEP Version 1.1 (mandatory)                                               |
| Playbook  | [APZHUB-PRODUCT-ADOPTION-PLAYBOOK.md](./APZHUB-PRODUCT-ADOPTION-PLAYBOOK.md) |

## Purpose

Define the repeatable path from **wrapped / integrated application** to
**mature native APZHUB product experience**.

This standard copies the **maturation process**, not product code.

## Mandatory phases

Every integrated product must complete the following before it is considered a
**mature APZHUB product**:

| Phase    | Title                        | Intent                                       |
| -------- | ---------------------------- | -------------------------------------------- |
| **N-01** | Native UX Audit              | Establish facts without changing the product |
| **N-02** | Identity Convergence         | Consume APZHUB identity, session, RBAC only  |
| **N-03** | Native Workspace Experience  | Indistinguishable APZHUB product chrome      |
| **N-04** | Operational Quality Adoption | Every change runs through APZQEP             |

## Phase rules

### N-01 — Native UX Audit

- Analysis only unless a follow-on slice is authorised
- Gap register with severity and feed-forward
- Engine / adapter leakage findings are Critical

### N-02 — Identity Convergence

- No second login
- No engine identities, roles, or permissions exposed
- Product consumes platform identity; never owns it

### N-03 — Native Workspace Experience

- Native layout, navigation, breadcrumbs, empty/loading/error states
- APZHUB terminology and icons only
- No engine terminology, adapter console feeling, or raw JSON for end users
- Help and product settings are APZHUB-owned when introduced

### N-04 — Operational Quality Adoption

- Do not measure features; measure behaviour
- Every change: Quality Flow → Impact → Policy → Decision → Evidence → Learning
- No dual quality process; no engine-native APZHUB release path
- Publish product ops pack (lifecycle, release process, checklists, metrics, learning, roles)
- Reference ops pack: [../apztime/](../apztime/) (APZ Time)

## Reference implementation

**APZ Time** is the reference completion of N-01…N-04:

| Artefact         | Path                                                                         |
| ---------------- | ---------------------------------------------------------------------------- |
| Native programme | [../time/APZHUB-TIME-NATIVE-001/](../time/APZHUB-TIME-NATIVE-001/)           |
| Operational pack | [../apztime/](../apztime/)                                                   |
| Playbook         | [APZHUB-PRODUCT-ADOPTION-PLAYBOOK.md](./APZHUB-PRODUCT-ADOPTION-PLAYBOOK.md) |

Subsequent products (Projects, Support, Documents, Analytics, Workflow, Law, …)
should follow the same sequence under separate Owner Authorisation — and only after
real APZQEP releases have exercised these standards.

## Explicit non-goals

- Kimai / Plane / Zammad / etc. feature parity as a maturity metric
- Copying Time UI code into other products
- Expanding APZQEP architecture as part of product adoption
- Pulling Phase C capabilities forward without operational evidence

## Relationship

| Framework doc                                                        | Role                                                 |
| -------------------------------------------------------------------- | ---------------------------------------------------- |
| [PRODUCT-ENGINEERING-STANDARD.md](./PRODUCT-ENGINEERING-STANDARD.md) | How products are engineered                          |
| [PRODUCT-QUALITY-STANDARD.md](./PRODUCT-QUALITY-STANDARD.md)         | Quality expectations                                 |
| **This standard**                                                    | Path from integrated engine to native APZHUB product |
| APZQEP-ADOPT-001                                                     | Ongoing operational quality practice                 |
