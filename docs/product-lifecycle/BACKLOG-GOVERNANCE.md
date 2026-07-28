# Continuous Backlog Governance

> **Programme:** APZHUB-PRODUCT-LIFECYCLE-001  
> **Complements:** [PRODUCT-BACKLOG-STANDARD](../products/PRODUCT-BACKLOG-STANDARD.md) · [ACTIVE-BACKLOG](../foundation/ACTIVE-BACKLOG.md) · [CURRENT-MILESTONE](../foundation/CURRENT-MILESTONE.md)

---

## Single continuous backlog model

| Layer                 | Role                                                                                           |
| --------------------- | ---------------------------------------------------------------------------------------------- |
| **Portfolio backlog** | Cross-product priorities (platform + products) — Owner-visible                                 |
| **Product backlog**   | `{product}/BACKLOG.md` per [PRODUCT-BACKLOG-STANDARD](../products/PRODUCT-BACKLOG-STANDARD.md) |
| **Platform backlog**  | Shared platform capabilities, ops, debt, security, compliance                                  |
| **CURRENT-MILESTONE** | Authorises _what may execute now_ — not a substitute for backlog hygiene                       |

Rules:

1. Every executable item has a stable ID, classification, priority, owner role, and acceptance criteria.
2. Items are **not** authorised for engineering until Owner Approval (see [OWNER-APPROVAL.md](./OWNER-APPROVAL.md)).
3. Do **not** invent programme IDs; Owner assigns work-item / programme IDs when approving.
4. STOP / deferred themes remain tagged **STOP** or **Deferred** until dedicated Approval.
5. Historical Release 1.2 planning backlog may seed the continuous backlog; it is not a living mega-plan.

## Classification (mandatory)

Reuse Release 1.2 planning legend (or successor): Production Defect · Security · Compliance · Operational · Performance · Scalability · DX · Technical Debt · Customer Enhancement · Platform Capability · Integration · Automation · AI · Deferred · Future Product/Platform · Research.

## Priorities

| Priority      | Meaning                           | Typical path                       |
| ------------- | --------------------------------- | ---------------------------------- |
| P0            | Blocking Production / severe risk | Hotfix or immediate Owner Approval |
| P1            | Next train commitment candidates  | Quarterly planning                 |
| P2            | Valuable, not train-critical      | Backlog grooming                   |
| P3 / Deferred | Future                            | Explicit deferral                  |

## Continuous grooming

- Weekly (or agreed cadence): intake triage → classify → prioritise.
- Quarterly: select train commitments (see [RELEASE-TRAINS.md](./RELEASE-TRAINS.md)).
- After incidents / PIR / audits: inject follow-ups with links to evidence.
