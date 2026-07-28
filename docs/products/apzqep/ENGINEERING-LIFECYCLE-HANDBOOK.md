# APZQEP Engineering Lifecycle Handbook

| Field             | Value                                                                                                                                                                                                                                                    |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Document          | **APZQEP Engineering Lifecycle Handbook**                                                                                                                                                                                                                |
| Classification    | Portfolio-level operational reference                                                                                                                                                                                                                    |
| Version           | **1.1.0**                                                                                                                                                                                                                                                |
| Date              | 2026-07-29                                                                                                                                                                                                                                               |
| Authority         | Owner Governance Observation (2026-07-27) · APZQEP-GOV-ENG-BUILD-001 **ACCEPTED** (2026-07-29)                                                                                                                                                           |
| Complements       | Document 000 · OES-000 · OES-001 · OES-002 · **OES-003** / [Engineering Build Contract](../../engineering/oes/ENGINEERING-BUILD-CONTRACT.md) **IN FORCE** — does **not** replace them                                                                    |
| Entry point       | [APZQEP-CONSTITUTION.md](./APZQEP-CONSTITUTION.md) **v1.0.0 — RATIFIED / APPROVED / BASELINED** (2026-07-28) — read the ratified Constitution first, then this handbook                                                                                  |
| Operating Model   | [APZOR Engineering Operating Model Validation](../../engineering/oes/APZOR-ENGINEERING-OPERATING-MODEL-VALIDATION.md) — **VALIDATED 1.0.0** · Enhancement **1.1.0 BASELINED / IN FORCE** ([GOV-ENG-BUILD-001](./governance/GOV-ENG-BUILD-001/README.md)) |
| Foundation status | **IMMUTABLE HISTORY** — [STANDING-PROGRAMME-RECORD.md](./STANDING-PROGRAMME-RECORD.md) **IN FORCE**. Wave 2: ARCH-015 + OES-ENG-090A **BASELINED / CLOSED**. OM 1.1.0 **IN FORCE**. Engineering Waves **NOT AUTHORISED**.                                |

## Purpose

Show engineers and AI agents **how APZ QEP capabilities are actually delivered**, using programmes already executed. This handbook is the operational map of the factory; the OES trilogy remains the normative standard.

**Read [APZQEP-CONSTITUTION.md](./APZQEP-CONSTITUTION.md) first** — **RATIFIED / APPROVED / BASELINED** (2026-07-28) — it is the constitutional entry point for APZQEP and prevails over this handbook on conflict (subject only to Document 000).

## Canonical lifecycle (validated · Engineering stage enhanced)

```text
Architecture
        ↓
Owner Architecture Acceptance
        ↓
Owner Engineering Specification (OES)
        ↓
Owner OES Acceptance
        ↓
Engineering Build Contract (mandatory for Engineering)
        ↓
Engineering Wave(s)  →  Owner Review between Waves
        ↓
Engineering Completion Review (ECR)
        ↓
Owner Acceptance
        ↓
Independent Certification
        ↓
Version Promotion
        ↓
Owner Freeze
```

No stage may be bypassed. Certification remains independent of engineering ([OES-CERTIFICATION-INDEPENDENCE](../../engineering/oes/OES-CERTIFICATION-INDEPENDENCE.md)).

### Engineering Build Contract & Waves (Operating Model Enhancement 1.1.0)

Normative:

- [ENGINEERING-BUILD-CONTRACT.md](../../engineering/oes/ENGINEERING-BUILD-CONTRACT.md)
- [OES-003](../../engineering/oes/OES-003-Engineering-Build-Contract-and-Wave-Engineering-Standard.md)
- Programme pack: [governance/GOV-ENG-BUILD-001/](./governance/GOV-ENG-BUILD-001/README.md)

**Rule:** Future Engineering is authorised **one Wave at a time**. Monolithic “build the whole capability” Engineering programmes are superseded. Agents **SHALL NOT** redesign Architecture or change Engineering Specifications during Engineering.

**Test Execution:** Waves → ECR → CERT → FREEZE **CLOSED** · baseline **`@apzhub/qep-test-execution` 1.0.0**. **APZQEP-RELEASE-001** — **IMPLEMENTED / AWAITING OWNER DECISION** ([test-execution/RELEASE-001/](./test-execution/RELEASE-001/README.md)) · recommended **LIMITED_AVAILABILITY_APPROVED**. Unrestricted GA **NOT AUTHORISED** until L-02 remediated.

## Capability status (2026-07-27)

| Capability          | Architecture             | Domain              | Infrastructure     | Workbench                          | Certification                                           | Freeze                                    |
| ------------------- | ------------------------ | ------------------- | ------------------ | ---------------------------------- | ------------------------------------------------------- | ----------------------------------------- |
| Requirements        | ✅                       | ✅                  | ✅                 | ✅                                 | ✅                                                      | ✅                                        |
| Traceability        | ✅                       | ✅                  | ✅                 | ✅                                 | ✅                                                      | ✅                                        |
| Verification        | ✅                       | ✅                  | ✅                 | ✅                                 | ✅                                                      | ✅                                        |
| Test Specifications | ✅                       | ✅                  | ✅                 | ✅                                 | ✅                                                      | ✅                                        |
| Test Plans          | ✅ Architecture ACCEPTED | ✅ Domain CERTIFIED | ✅ Infra CERTIFIED | ✅ Workbench CERTIFIED (Component) | ✅ Integrated Capability CERTIFIED / CLOSED — **1.0.0** | ✅ FREEZE-080A FROZEN / APPROVED / CLOSED |

**Note:** Test Plans Domain, Infrastructure, and Workbench streams are all **Component-certified** (`0.1.0` / `0.2.0` / `0.2.0`; **DOMAIN\_/INFRASTRUCTURE\_/WORKBENCH_PRODUCTION_READY_WITH_LIMITATIONS** respectively — **APZQEP-CERT-060A**, **APZQEP-CERT-060B**, **APZQEP-CERT-070A**, all **CERTIFIED / APPROVED / CLOSED**). The fourth and final gate, **Integrated Capability Certification** (**APZQEP-CERT-080A**), is **CERTIFIED / APPROVED / CLOSED** — class **PRODUCTION_READY_WITH_LIMITATIONS**; Version Promotion **0.2.0 → 1.0.0 APPLIED**. Freeze under **APZQEP-FREEZE-080A** is **FROZEN / APPROVED / CLOSED** — `@apzhub/qep-test-plans` **1.0.0 CERTIFIED / FROZEN / BASELINE ESTABLISHED**. See [OES-CERTIFICATION-LEVELS.md](../../engineering/oes/OES-CERTIFICATION-LEVELS.md).

**Portfolio note:** with all five capabilities above **1.0.0 CERTIFIED / FROZEN**, the First Capability Wave (Foundation) is complete. **APZQEP-PORTFOLIO-001** — Foundation Completion & Portfolio Baseline — consolidates this into a single handover pack and is **ACCEPTED / APPROVED / CLOSED** (Owner Acceptance 2026-07-28). See [portfolio/PORTFOLIO-001/](./portfolio/PORTFOLIO-001/README.md). **APZQEP FOUNDATION IS FORMALLY COMPLETE; CAPABILITY EXPANSION IS READY.** No Wave 2 capability (Test Execution, Test Runs, Test Suites, Evidence, Defects, Coverage & Analytics, Reporting, AI-Assisted Testing) is authorised by that pack or by this handbook — authorised next delivery under existing identifiers is **none**; each Wave 2 capability requires a new, separate Owner-authorised Architecture programme.

---

## 1. Requirements

**Package:** `@apzhub/qep-requirements` **1.0.0 CERTIFIED / FROZEN**

| Stage         | Programme                  | Status             |
| ------------- | -------------------------- | ------------------ |
| Architecture  | APZQEP-ARCH-005 / ARCH-006 | ACCEPTED / CLOSED  |
| Engineering   | APZQEP-ENG-020A … ENG-020F | ACCEPTED / CLOSED  |
| Certification | APZQEP-REQ-001             | ACCEPTED / CLOSED  |
| Freeze        | under REQ-001              | CERTIFIED / FROZEN |

Entry: [requirements/](./requirements/README.md)

---

## 2. Traceability

**Package:** `@apzhub/qep-traceability` **1.0.0 CERTIFIED / FROZEN**

| Stage         | Programme                              | Status             |
| ------------- | -------------------------------------- | ------------------ |
| Architecture  | APZQEP-ARCH-007 / ARCH-008             | ACCEPTED / CLOSED  |
| Engineering   | APZQEP-ENG-030A (Parts 1–2) · ENG-030C | ACCEPTED / CLOSED  |
| Certification | APZQEP-TRACE-001                       | ACCEPTED / CLOSED  |
| Freeze        | under TRACE-001                        | CERTIFIED / FROZEN |

Entry: [traceability/](./traceability/README.md)

---

## 3. Verification

**Package:** `@apzhub/qep-verification` **1.0.0 CERTIFIED / FROZEN**

| Stage          | Programme                  | Status             |
| -------------- | -------------------------- | ------------------ |
| Architecture   | APZQEP-ARCH-009 / ARCH-010 | ACCEPTED / CLOSED  |
| Domain         | APZQEP-ENG-040A            | ACCEPTED / CLOSED  |
| Infrastructure | APZQEP-ENG-040B            | ACCEPTED / CLOSED  |
| Workbench      | APZQEP-ENG-040C            | ACCEPTED / CLOSED  |
| Certification  | APZQEP-CERT-040D           | ACCEPTED / CLOSED  |
| Freeze         | under CERT-040D            | CERTIFIED / FROZEN |

Entry: [verification/](./verification/README.md)

---

## 4. Test Specifications

**Package:** `@apzhub/qep-test-specifications` **1.0.0 CERTIFIED / FROZEN**

| Stage                  | Programme           | Status                        |
| ---------------------- | ------------------- | ----------------------------- |
| Architecture           | APZQEP-ARCH-011     | ACCEPTED                      |
| Domain                 | APZQEP-ENG-050A     | ACCEPTED                      |
| Infrastructure         | APZQEP-ENG-050B     | ACCEPTED                      |
| Workbench Architecture | APZQEP-OES-ARCH-012 | ACCEPTED / BASELINED          |
| Workbench OES          | APZQEP-OES-ENG-050C | ACCEPTED                      |
| Workbench Engineering  | APZQEP-ENG-050C     | ACCEPTED / CLOSED             |
| Certification          | APZQEP-CERT-050D    | CERTIFIED / CLOSED            |
| Freeze                 | Owner Freeze Review | FROZEN / BASELINE ESTABLISHED |

Entry: [test-specifications/](./test-specifications/capability-certification/README.md)

---

## 5. Test Plans

**Package:** `@apzhub/qep-test-plans` **1.0.0 CERTIFIED / FROZEN** (Domain + Infrastructure + Workbench Component-CERTIFIED; integrated Capability CERTIFIED; Capability FROZEN)

| Stage                                  | Programme                      | Status                                                                                                                                                                                                                |
| -------------------------------------- | ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Architecture                           | APZQEP-ARCH-013 / OES-ARCH-013 | ACCEPTED / BASELINED / CLOSED                                                                                                                                                                                         |
| Domain OES                             | APZQEP-OES-ENG-060A            | ACCEPTED / BASELINED / CLOSED                                                                                                                                                                                         |
| Domain Engineering                     | APZQEP-ENG-060A                | ACCEPTED / APPROVED / CLOSED                                                                                                                                                                                          |
| Domain Certification                   | APZQEP-CERT-060A               | **CERTIFIED / APPROVED / CLOSED** · class **DOMAIN_PRODUCTION_READY_WITH_LIMITATIONS**                                                                                                                                |
| Infrastructure OES                     | APZQEP-OES-ENG-060B            | **ACCEPTED / BASELINED / CLOSED** — [OES-ENG-060B](./test-plans/OES-ENG-060B/README.md)                                                                                                                               |
| Infrastructure ENG                     | APZQEP-ENG-060B                | **ACCEPTED WITH RECORDED LIMITATIONS / CLOSED** — [OWNER-ACCEPTANCE](./test-plans/infrastructure/OWNER-ACCEPTANCE.md)                                                                                                 |
| Infrastructure CERT                    | APZQEP-CERT-060B               | **CERTIFIED / APPROVED / CLOSED** — [CERT-060B](./test-plans/CERT-060B/README.md) · **INFRASTRUCTURE_PRODUCTION_READY_WITH_LIMITATIONS**                                                                              |
| Workbench Architecture                 | APZQEP-ARCH-014                | **ACCEPTED / ARCHITECTURE BASELINED / PROGRAMME CLOSED** — [OES-ARCH-014](./test-plans/OES-ARCH-014/README.md)                                                                                                        |
| Workbench Engineering Specification    | APZQEP-OES-ENG-070A            | **ACCEPTED / ENGINEERING SPECIFICATION BASELINED / CLOSED** — [OES-ENG-070A](./test-plans/OES-ENG-070A/README.md)                                                                                                     |
| Workbench Engineering (implementation) | APZQEP-ENG-070A                | **ACCEPTED / APPROVED / PROGRAMME CLOSED** — [workbench/](./test-plans/workbench/README.md)                                                                                                                           |
| Workbench Component Certification      | APZQEP-CERT-070A               | **CERTIFIED / APPROVED / CLOSED** — **WORKBENCH_PRODUCTION_READY_WITH_LIMITATIONS** — [CERT-070A/](./test-plans/CERT-070A/README.md)                                                                                  |
| Integrated Capability Certification    | APZQEP-CERT-080A               | **CERTIFIED / APPROVED / CLOSED** — **PRODUCTION_READY_WITH_LIMITATIONS**, `@apzhub/qep-test-plans` promoted **0.2.0 → 1.0.0 APPLIED** — [capability-certification/](./test-plans/capability-certification/README.md) |
| Freeze                                 | APZQEP-FREEZE-080A             | **FROZEN / APPROVED / CLOSED** — `@apzhub/qep-test-plans` **1.0.0 CERTIFIED / FROZEN / BASELINE ESTABLISHED** — [freeze/](./test-plans/freeze/README.md)                                                              |

Entry: [test-plans/](./test-plans/README.md)

---

## Traceability (cross-cutting)

Every programme pack maintains Owner Acceptance / Completion / Evidence artefacts under `docs/products/apzqep/` and portfolio evidence under `docs/operations/evidence/portfolio-recert/`. Frozen upstream capabilities are referenced by identifier only — never re-implemented.

## Verification (cross-cutting)

- Unit / domain / architecture-boundary tests per ENG programme
- ECR under OES-002 before Owner Acceptance
- Independent CERT quality gates (no engineering inside CERT)
- Behavioural completeness may justify coverage deviations when independently reviewed ([practice note](../../engineering/oes/OES-COVERAGE-AND-BEHAVIOURAL-COMPLETENESS.md))

## STOP

This handbook does **not** authorise programmes. Only Owner Programme Instructions authorise work. Do not treat a row in this handbook as permission to begin engineering, certification, promotion, or freeze.
