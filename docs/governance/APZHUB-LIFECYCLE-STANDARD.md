# APZHUB Lifecycle Standard

| Field           | Value                                                                                                       |
| --------------- | ----------------------------------------------------------------------------------------------------------- |
| Document        | APZHUB Lifecycle Standard                                                                                   |
| Programme       | **APZHUB-FOUNDATION-002**                                                                                   |
| Status          | **IN FORCE**                                                                                                |
| Suite authority | [APZ Engineering Lifecycle Standard v1.0](../engineering/lifecycle-standard/v1.0/README.md) (**VALIDATED**) |
| Date            | 2026-08-01                                                                                                  |

---

## Purpose

Portfolio lifecycle standard for every APZHUB product.

**Normative engineering lifecycle content lives in the suite.** This document is the portfolio entry point and records release-governance additions proven by APZQEP RELEASE-004.

Do not duplicate stage definitions here. Prefer links.

---

## Authoritative suite

| Topic                          | Authority                                                                                   |
| ------------------------------ | ------------------------------------------------------------------------------------------- |
| Engineering lifecycle          | [ENGINEERING-LIFECYCLE.md](../engineering/lifecycle-standard/v1.0/ENGINEERING-LIFECYCLE.md) |
| Programme types                | [PROGRAMME-LIFECYCLE.md](../engineering/lifecycle-standard/v1.0/PROGRAMME-LIFECYCLE.md)     |
| Certification                  | [certification/](../engineering/lifecycle-standard/v1.0/certification/)                     |
| Freeze                         | [freeze/](../engineering/lifecycle-standard/v1.0/freeze/)                                   |
| Release                        | [release/](../engineering/lifecycle-standard/v1.0/release/)                                 |
| Owner governance               | [OWNER-GOVERNANCE.md](../engineering/lifecycle-standard/v1.0/OWNER-GOVERNANCE.md)           |
| Diagrams                       | [diagrams/LIFECYCLE.md](../engineering/lifecycle-standard/v1.0/diagrams/LIFECYCLE.md)       |
| Dashboard programme lifecycle  | [PROGRAMME-LIFECYCLE.md](./PROGRAMME-LIFECYCLE.md)                                          |
| Certification status model     | [CERTIFICATION-LIFECYCLE.md](./CERTIFICATION-LIFECYCLE.md)                                  |
| Product lifecycle (commercial) | [../products/PRODUCT-LIFECYCLE.md](../products/PRODUCT-LIFECYCLE.md)                        |

---

## Portfolio state model (release domain)

```text
PLANNED
  → ENGINEERING
  → CERTIFICATION
  → FROZEN
  → OWNER_ACCEPTED
  → RELEASE_AUTHORISED
  → PRECONDITIONS
  → READY_FOR_EXECUTION
  → EXECUTING
  → DEPLOYED (when authorised)
  → VERIFIED
  → CLOSED
  → ARCHIVED
```

Interruption states: `BLOCKED` · `FAILED` · `SUPERSEDED` · `ROLLED_BACK` · `CANCELLED`

Each state has permitted / prohibited actions defined by the active programme instruction and the suite. Engineering authority is **CLOSED** after Owner-accepted Freeze unless a new Owner programme reopens it.

---

## Operational Hold

When release preconditions fail (e.g. repository access):

- Release state = `BLOCKED`
- Next authorised action = **Continue Release Execution** after clearance (not “resume engineering”)
- Mutations **PROHIBITED**
- Inspect / verify / report only

Proven by APZQEP-RELEASE-004 (B-01).

---

## Go / No-Go gate

Mandatory immediately before the first release mutation:

1. Authenticated release identity
2. Repository URL and reachability
3. Write permission
4. Target branch
5. Clean working tree
6. Authorised candidate integrity / ancestry
7. No unauthorised engineering after Freeze
8. Package / tag preconditions
9. Timestamped verification report
10. Explicit **GO** or **NO GO**

**NO GO** → STOP · await Owner. Do not continue automatically.

---

## Release Candidate Supersession

Once a Production Freeze has been Owner Accepted:

- Behavioural, evidence, certification, governance, or release-process corrections that change the release candidate **SHALL** open a **new** Release Programme.
- The prior Release Programme becomes **SUPERSEDED** and **SHALL NOT** resume.
- The Production Freeze remains valid unless engineering artefacts change (then a new Freeze is required).
- Release Programmes are disposable. Production Freezes are authoritative.

---

## Remediation · Closure · Archive · Enhancement · Maintenance · Rollback · Recovery

| Mode              | Rule                                                             |
| ----------------- | ---------------------------------------------------------------- |
| Remediation       | Narrow Owner programme; classify docs-only vs engineering        |
| Programme closure | Closure Officer; archive index; portfolio handover               |
| Archive           | Reference in place; do not move/rename historical packs          |
| Enhancement       | New Owner-authorised product programme                           |
| Maintenance       | Patch/hotfix under Owner programme; Lifecycle suite applies      |
| Rollback          | Do not move shared tags without Owner approval; preserve history |
| Recovery          | Operational guides under `docs/governance/` / `docs/operations/` |

---

## Owner vs AI authority

| Actor | Authority                                                                                                                             |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Owner | Authorise programmes, accept freezes/releases, clear operational blockers, supersede                                                  |
| AI    | Execute only within role and programme; STOP on conflict ([APZHUB-AI-OPERATIONAL-FRAMEWORK.md](./APZHUB-AI-OPERATIONAL-FRAMEWORK.md)) |

---

## Evidence requirements

Every lifecycle stage that mutates repository or production state **SHALL** record immutable evidence under `docs/operations/evidence/`. Existing evidence is never rewritten; corrections are additive.

---

## STOP

```text
APZHUB-LIFECYCLE-STANDARD
IN FORCE
SUITE = engineering/lifecycle-standard/v1.0
RELEASE GOVERNANCE ADDITIONS = OPERATIONAL HOLD · GO/NO-GO · SUPERSESSION
```
