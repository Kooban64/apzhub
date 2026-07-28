# APZQEP-OES-ENG-050C

# PART 1 — Programme Scope, Objectives & Constraints

| Item                | Value                                                                                               |
| ------------------- | --------------------------------------------------------------------------------------------------- |
| Document            | APZQEP-OES-ENG-050C                                                                                 |
| Part                | **1 of 5**                                                                                          |
| Status              | **FILED**                                                                                           |
| Governing standards | OES-000 · OES-001 · OES-002 (**FROZEN**)                                                            |
| Architecture        | [OES-ARCH-012](../OES-ARCH-012-Test-Specifications-Workbench-Architecture/COMPLETE.md) **ACCEPTED** |

---

## 1 Executive summary

This OES specifies the **Workbench Engineering** programme that implements the Test Specifications presentation layer for APZ QEP.

It translates the Accepted Architecture (OES-ARCH-012) into an implementable delivery contract: work packages, technical approach, tests, quality gates, and Acceptance criteria.

**Implementation MUST NOT begin until this OES is Owner-Accepted under OES-002.**

---

## 2 Programme objective

Deliver a production-quality Test Specifications Workbench that:

1. Conforms to OES-ARCH-012 without architectural invention
2. Consumes ENG-050B REST (`/api/v1/qep/specifications`) only
3. Renders server `availableActions` as the sole action authority
4. Reuses ARCH-006 / Platform shell grammar and Design System (006 / 028)
5. Meets WCAG AA, performance, and security targets in OES-ARCH-012 Part 5
6. Passes unit, component, integration, and Playwright gates (015)

---

## 3 Baselines (normative)

| Baseline                                   | Status                   | Role                                               |
| ------------------------------------------ | ------------------------ | -------------------------------------------------- |
| Document 000                               | FROZEN                   | Platform constitution                              |
| OES-000 / 001 / 002                        | FROZEN                   | Methodology / writing / review                     |
| Requirements / Traceability / Verification | 1.0.0 CERTIFIED / FROZEN | Upstream capabilities                              |
| ARCH-006                                   | ACCEPTED                 | Shell grammar                                      |
| ARCH-011                                   | ACCEPTED                 | Capability architecture                            |
| ENG-050A                                   | ACCEPTED                 | Domain                                             |
| ENG-050B                                   | ACCEPTED                 | Infrastructure / REST                              |
| OES-ARCH-012                               | ACCEPTED                 | Workbench Architecture                             |
| ADR-0074                                   | ACCEPTED                 | Rejected → Draft contract gap — UI must not invent |

---

## 4 Layer ownership

| Layer                                | This programme                            |
| ------------------------------------ | ----------------------------------------- |
| Presentation / Workbench             | **OWNS** — UI implementation              |
| Platform Services / REST             | Consumes — MUST NOT redefine              |
| Domain                               | Consumes — MUST NOT change rules          |
| Persistence                          | MUST NOT touch                            |
| Permissions / Audit / Search engines | Consumes platform — MUST NOT re-implement |

---

## 5 Explicit non-goals

This programme SHALL NOT:

- Redesign Workbench Architecture (OES-ARCH-012 is baselined)
- Invent `availableActions` or lifecycle transitions (ADR-0074)
- Implement Test Cases, Executions, Evidence, Coverage, Impact, Certification
- Own notification delivery, search indexing, or audit SoR
- Bypass API Gateway / Platform Services
- Introduce mandatory commercial UI libraries outside approved stack (004)
- Begin implementation before Owner Acceptance of this OES

---

## 6 Prerequisites to start coding

| Gate                                                           | Required                                                             |
| -------------------------------------------------------------- | -------------------------------------------------------------------- |
| This OES `COMPLETE.md` Owner-Accepted                          | ✅                                                                   |
| OES-ARCH-012 Accepted                                          | ✅ (done)                                                            |
| ENG-050B Accepted                                              | ✅ (done)                                                            |
| Separate Owner Instruction to commence ENG-050C implementation | ✅ (implied by Acceptance of this OES unless Owner states otherwise) |

---

## 7 Success criteria (programme)

Successful when another engineer can implement and certify the Workbench using only:

- This OES
- OES-ARCH-012
- ENG-050B REST docs
- Platform shell / Design System

…without inventing IA, actions, or business rules.

---

## END OF PART 1
