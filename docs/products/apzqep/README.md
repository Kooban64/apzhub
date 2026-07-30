# APZ QEP — APZ Quality Engineering Platform

> **Official product name:** **APZ QEP** (APZ Quality Engineering Platform)  
> **Requirements / Traceability / Verification / Test Specifications / Test Plans:** all **1.0.0 CERTIFIED / FROZEN**  
> **Test Plans Domain:** **0.1.0 CERTIFIED** · **CERT-060A CLOSED**  
> **Test Plans Infrastructure:** **ENG-060B ACCEPTED / CLOSED** · **CERT-060B CERTIFIED / APPROVED / CLOSED** · `@apzhub/qep-test-plans` **0.2.0 INFRASTRUCTURE COMPONENT CERTIFIED**  
> **Test Plans Workbench Architecture:** **APZQEP-ARCH-014** — **ACCEPTED / ARCHITECTURE BASELINED / PROGRAMME CLOSED**  
> **Test Plans Workbench Engineering Specification:** **APZQEP-OES-ENG-070A** — **ACCEPTED / ENGINEERING SPECIFICATION BASELINED / CLOSED**  
> **Test Plans Workbench Engineering:** **APZQEP-ENG-070A** — **ACCEPTED / APPROVED / PROGRAMME CLOSED**  
> **Test Plans Workbench Component Certification:** **APZQEP-CERT-070A** — **CERTIFIED / APPROVED / CLOSED**  
> **Test Plans Integrated Capability Certification:** **APZQEP-CERT-080A** — **CERTIFIED / APPROVED / CLOSED** · `@apzhub/qep-test-plans` **1.0.0 CERTIFIED**  
> **Certified class:** **INFRASTRUCTURE_PRODUCTION_READY_WITH_LIMITATIONS** (Infrastructure) · **WORKBENCH_PRODUCTION_READY_WITH_LIMITATIONS** (Workbench) · **PRODUCTION_READY_WITH_LIMITATIONS** (Capability)  
> **Test Plans Freeze:** **APZQEP-FREEZE-080A** — **FROZEN / APPROVED / CLOSED** · `@apzhub/qep-test-plans` **1.0.0 CERTIFIED / FROZEN / BASELINE ESTABLISHED**  
> **Handbook:** [ENGINEERING-LIFECYCLE-HANDBOOK.md](./ENGINEERING-LIFECYCLE-HANDBOOK.md)  
> **Owner Portfolio Declaration:** **DECLARED** (2026-07-28) — [OWNER-PORTFOLIO-DECLARATION.md](./OWNER-PORTFOLIO-DECLARATION.md) — Foundation → Expansion handover completed via **APZQEP-PORTFOLIO-001**  
> **APZQEP-PORTFOLIO-001** — Foundation Completion & Portfolio Baseline — **ACCEPTED / APPROVED / CLOSED** (2026-07-28) — [portfolio/PORTFOLIO-001/](./portfolio/PORTFOLIO-001/README.md)  
> **APZQEP-CONSTITUTION** — **v1.0.0 RATIFIED / APPROVED / BASELINED** (2026-07-28) — [APZQEP-CONSTITUTION.md](./APZQEP-CONSTITUTION.md) · [APZQEP-CONSTITUTION-OWNER-RATIFICATION.md](./APZQEP-CONSTITUTION-OWNER-RATIFICATION.md) — the constitutional entry point for APZQEP  
> **Standing Programme Record:** **IN FORCE** (2026-07-30) — [STANDING-PROGRAMME-RECORD.md](./STANDING-PROGRAMME-RECORD.md) — **official standing state** of APZQEP (permanent baseline for future conversations)  
> **Final Executive Declaration:** **DECLARED** (2026-07-28) — [FINAL-EXECUTIVE-DECLARATION.md](./FINAL-EXECUTIVE-DECLARATION.md) — Foundation Programme **permanently closed**  
> **APZQEP-CAPABILITY-002** — Next Product Capability — **ACCEPTED / CLOSED** — selected **Evidence Management** — [CAPABILITY-002/](./CAPABILITY-002/README.md)  
> **APZQEP-ARCH-016** — Evidence Management Capability Architecture — **ACCEPTED / ARCHITECTURE BASELINED / CLOSED** — [evidence-management/OES-ARCH-016/](./evidence-management/OES-ARCH-016/README.md)  
> **APZQEP-OES-ENG-091A** — Evidence Management Engineering Specification — **ACCEPTED / ENGINEERING SPECIFICATION BASELINED / CLOSED** — [evidence-management/OES-ENG-091A/](./evidence-management/OES-ENG-091A/README.md)  
> **APZQEP-ENG-110A** — Evidence Management Repository Scaffolding — **ACCEPTED / REPOSITORY SCAFFOLDING BASELINED / CLOSED** — [evidence-management/ENG-110A/](./evidence-management/ENG-110A/README.md)  
> **APZQEP-ENG-110B** — Evidence Management Feature Wave 1 (Core Domain) — **ACCEPTED / CORE DOMAIN BASELINED / CLOSED** — [evidence-management/ENG-110B/](./evidence-management/ENG-110B/README.md) · Acceptance `20260730T030000Z-APZQEP-ENG-110B-ACCEPTANCE.json`  
> **APZQEP-ENG-110C** — Evidence Management Feature Wave 2 (Persistence & Storage Abstractions) — **ACCEPTED / PERSISTENCE & STORAGE ABSTRACTIONS BASELINED / CLOSED** — [evidence-management/ENG-110C/](./evidence-management/ENG-110C/README.md) · Acceptance `20260730T032000Z-APZQEP-ENG-110C-ACCEPTANCE.json`  
> **APZQEP-ENG-110D** — Evidence Management Feature Wave 3 (Application Services) — **ACCEPTED / APPLICATION SERVICES BASELINED / CLOSED** — [evidence-management/ENG-110D/](./evidence-management/ENG-110D/README.md) · Acceptance `20260730T033500Z-APZQEP-ENG-110D-ACCEPTANCE.json`  
> **APZQEP-ENG-110E** — Evidence Management Feature Wave 4 (Security & Policy) — **ACCEPTED / SECURITY & POLICY INTEGRATION BASELINED / CLOSED** — [evidence-management/ENG-110E/](./evidence-management/ENG-110E/README.md) · Acceptance `20260730T070000Z-APZQEP-ENG-110E-ACCEPTANCE.json`  
> **APZQEP-ENG-110F** — Evidence Management Feature Wave 5 (Transport & Workbench) — **ACCEPTED / TRANSPORT LAYER & WORKBENCH BASELINED / CLOSED** — [evidence-management/ENG-110F/](./evidence-management/ENG-110F/README.md) · Acceptance `20260730T081900Z-APZQEP-ENG-110F-ACCEPTANCE.json`  
> **APZQEP-OPS-001** — Evidence Management Operational Readiness — **ACCEPTED / OPERATIONAL READINESS BASELINED / CLOSED** — [evidence-management/OPS-001/](./evidence-management/OPS-001/README.md) · Acceptance `20260730T083200Z-APZQEP-OPS-001-ACCEPTANCE.json`  
> **APZQEP-CERT-003** — Evidence Management Certification — **ACCEPTED / CERTIFICATION BASELINED / CLOSED** — [evidence-management/CERT-003/](./evidence-management/CERT-003/README.md) · **PRODUCTION_READY_WITH_LIMITATIONS** · **LIMITED_AVAILABILITY** · Acceptance `20260730T090800Z-APZQEP-CERT-003-ACCEPTANCE.json`  
> **APZQEP-FREEZE-003** — Evidence Management Production Freeze — **ACCEPTED / PRODUCTION BASELINE FROZEN / CLOSED** — [evidence-management/FREEZE-003/](./evidence-management/FREEZE-003/README.md) · RC `@apzhub/qep-evidence` **1.0.0-rc.1** @ `ce220a5d` · Acceptance `20260730T171800Z-APZQEP-FREEZE-003-ACCEPTANCE.json`  
> **APZQEP-REM-002** — Provenance Playwright Remediation — **APPROVED AND CLOSED** — [evidence-management/REM-002/](./evidence-management/REM-002/README.md) · Acceptance `20260730T182900Z-APZQEP-REM-002-ACCEPTANCE.json`  
> **APZQEP-FREEZE-004** — Post-REM-002 Release Candidate Freeze — **ACCEPTED / PRODUCTION BASELINE FROZEN / CLOSED** — [evidence-management/FREEZE-004/](./evidence-management/FREEZE-004/README.md) · RC `@apzhub/qep-evidence` **1.0.0-rc.2** @ `4e1b6f01` · Acceptance `20260730T190800Z-APZQEP-FREEZE-004-ACCEPTANCE.json`  
> **APZQEP-RELEASE-003** — Evidence Management Production Release — **STOPPED / REPLACED BY RELEASE-004** — must not resume — [evidence-management/RELEASE-003/](./evidence-management/RELEASE-003/README.md)  
> **APZQEP-RELEASE-004** — Evidence Management Limited Availability Production Release — **BLOCKED** (B-01) — [evidence-management/RELEASE-004/](./evidence-management/RELEASE-004/README.md) · source `4e1b6f01` · Evidence `20260730T191000Z-APZQEP-RELEASE-004-BLOCKED.json`

> **APZQEP-ARCH-015** — Test Execution Capability Architecture — **ACCEPTED / APPROVED / ARCHITECTURE BASELINED / CLOSED** — [test-execution/OES-ARCH-015/](./test-execution/OES-ARCH-015/README.md) · [OWNER-RECORD](./test-execution/OES-ARCH-015/OWNER-RECORD.md)  
> **APZQEP-OES-ENG-090A** — Test Execution Engineering Specification — **ACCEPTED / APPROVED / ENGINEERING SPECIFICATION BASELINED / CLOSED** — [test-execution/OES-ENG-090A/](./test-execution/OES-ENG-090A/README.md) · [OWNER-ACCEPTANCE](./test-execution/OES-ENG-090A/OWNER-ACCEPTANCE.md)  
> **APZQEP-GOV-ENG-BUILD-001** — Engineering Build Contract + Wave Engineering — **ACCEPTED / OPERATING MODEL AMENDMENT BASELINED / CLOSED** — [governance/GOV-ENG-BUILD-001/](./governance/GOV-ENG-BUILD-001/README.md) · [OWNER-ACCEPTANCE](./governance/GOV-ENG-BUILD-001/OWNER-ACCEPTANCE.md)  
> **OM Enhancement 1.1.0 IN FORCE** · Build Contract **IN FORCE** · Test Execution ARCH + ES BASELINED  
> **APZQEP-ENG-100A** — Scaffolding — **WAVE 1 BASELINED / CLOSED** — [ENG-100A](./test-execution/ENG-100A/README.md)  
> **APZQEP-ENG-100B** — Domain — **ACCEPTED / ENGINEERING WAVE 2 BASELINED / CLOSED** — [ENG-100B](./test-execution/ENG-100B/README.md)  
> **APZQEP-ENG-100C** — Application — **ACCEPTED / ENGINEERING WAVE 3 BASELINED / CLOSED** — [ENG-100C](./test-execution/ENG-100C/README.md)  
> **APZQEP-ENG-100D** — Infrastructure & API — **ACCEPTED / ENGINEERING WAVE 4 BASELINED / CLOSED** — [ENG-100D](./test-execution/ENG-100D/README.md)  
> **APZQEP-ENG-100E** — Workbench — **ACCEPTED / ENGINEERING WAVE 5 BASELINED / CLOSED** — [ENG-100E](./test-execution/ENG-100E/README.md)  
> **APZQEP-ECR-001** — Engineering Completion Review — **ACCEPTED / ECR BASELINED / CLOSED** — [ECR-001](./test-execution/ECR-001/README.md)  
> **APZQEP-CERT-001** — Certification — **ACCEPTED / CERTIFICATION BASELINED / CLOSED** — [CERT-001](./test-execution/CERT-001/README.md) · **PRODUCTION_READY_WITH_LIMITATIONS**  
> **APZQEP-FREEZE-001** — Production Freeze — **ACCEPTED / PRODUCTION BASELINE FROZEN / CLOSED** — [FREEZE-001](./test-execution/FREEZE-001/README.md) · Baseline **`@apzhub/qep-test-execution` 1.0.0**  
> **APZQEP-RELEASE-001** — Production Release — **ACCEPTED / PRODUCTION RELEASE BASELINED / CLOSED** — [RELEASE-001](./test-execution/RELEASE-001/README.md) · **LIMITED_AVAILABILITY_APPROVED**  
> Test Execution lifecycle **COMPLETE** · Unrestricted GA **NOT APPROVED** (L-02)  
> **APZQEP-LIFECYCLE-001** — APZ Engineering Lifecycle Standard v1.0 — **IMPLEMENTED / AWAITING OWNER DECISION** — [LIFECYCLE-001](./LIFECYCLE-001/README.md) · [suite](../../engineering/lifecycle-standard/v1.0/README.md)  
> Authorised next delivery: **Owner Lifecycle Standard Decision only** · Do **not** apply standard to another product without a new Directive

> **Rule:** CERT-060B, CERT-070A, and CERT-080A are independent assurance only, now CLOSED. ARCH-014, OES-ENG-070A, and ENG-070A are all ACCEPTED / CLOSED. **APZQEP-CERT-080A** (Test Plans Integrated Capability Certification) is **CERTIFIED / APPROVED / CLOSED**; `@apzhub/qep-test-plans` was promoted to **1.0.0**. **APZQEP-FREEZE-080A** (Capability Freeze) is **FROZEN / APPROVED / CLOSED** — see [test-plans/freeze/](./test-plans/freeze/README.md). No further Test Plans work is authorised under existing identifiers; future work requires a new Owner-authorised programme. Portfolio-wide: **APZQEP-PORTFOLIO-001** consolidates all five frozen capabilities into a single Foundation Completion baseline — **ACCEPTED / APPROVED / CLOSED**; APZQEP Foundation is formally complete and Capability Expansion is READY; no Wave 2 programme is authorised. **APZQEP-CONSTITUTION v1.0.0 is RATIFIED / APPROVED / BASELINED** (2026-07-28) — see [APZQEP-CONSTITUTION-OWNER-RATIFICATION.md](./APZQEP-CONSTITUTION-OWNER-RATIFICATION.md). Authorised next delivery: **none** under existing identifiers — any Wave 2 capability (Test Execution, Test Runs, Test Suites, Evidence, Defects, Coverage & Analytics, Reporting, AI-Assisted Testing) requires a new, separate Owner-authorised Architecture programme; do not invent or start one.

## Start here

| Audience                                                                     | Document                                                                                                         |
| ---------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| **Everyone (first read)**                                                    | [APZQEP-CONSTITUTION.md](./APZQEP-CONSTITUTION.md) **v1.0.0** — **RATIFIED / APPROVED / BASELINED** (2026-07-28) |
| **Standing Programme Record (starting state)**                               | [STANDING-PROGRAMME-RECORD.md](./STANDING-PROGRAMME-RECORD.md)                                                   |
| **Final Executive Declaration (Foundation closed)**                          | [FINAL-EXECUTIVE-DECLARATION.md](./FINAL-EXECUTIVE-DECLARATION.md)                                               |
| **ENG-110E Evidence Management (Security awaiting Owner)**                   | [evidence-management/ENG-110E/OWNER-SUMMARY.md](./evidence-management/ENG-110E/OWNER-SUMMARY.md)                 |
| **ENG-110D Evidence Management (Application Services CLOSED)**               | [evidence-management/ENG-110D/OWNER-ACCEPTANCE.md](./evidence-management/ENG-110D/OWNER-ACCEPTANCE.md)           |
| **ENG-110C Evidence Management (Persistence Abstractions CLOSED)**           | [evidence-management/ENG-110C/OWNER-ACCEPTANCE.md](./evidence-management/ENG-110C/OWNER-ACCEPTANCE.md)           |
| **ENG-110B Evidence Management (Core Domain CLOSED)**                        | [evidence-management/ENG-110B/OWNER-ACCEPTANCE.md](./evidence-management/ENG-110B/OWNER-ACCEPTANCE.md)           |
| **ENG-110A Evidence Management (Scaffolding CLOSED)**                        | [evidence-management/ENG-110A/OWNER-ACCEPTANCE.md](./evidence-management/ENG-110A/OWNER-ACCEPTANCE.md)           |
| **OES-ENG-091A Evidence Management (Eng Spec CLOSED)**                       | [evidence-management/OES-ENG-091A/OWNER-ACCEPTANCE.md](./evidence-management/OES-ENG-091A/OWNER-ACCEPTANCE.md)   |
| **ARCH-016 Evidence Management (Architecture CLOSED)**                       | [evidence-management/OES-ARCH-016/OWNER-ACCEPTANCE.md](./evidence-management/OES-ARCH-016/OWNER-ACCEPTANCE.md)   |
| **CAPABILITY-002 (selection CLOSED — Evidence Management)**                  | [CAPABILITY-002/OWNER-ACCEPTANCE.md](./CAPABILITY-002/OWNER-ACCEPTANCE.md)                                       |
| **ARCH-015 Test Execution (Architecture baselined / CLOSED)**                | [test-execution/OES-ARCH-015/OWNER-ACCEPTANCE.md](./test-execution/OES-ARCH-015/OWNER-ACCEPTANCE.md)             |
| **OES-ENG-090A Test Execution (ES baselined / CLOSED)**                      | [test-execution/OES-ENG-090A/OWNER-ACCEPTANCE.md](./test-execution/OES-ENG-090A/OWNER-ACCEPTANCE.md)             |
| **GOV-ENG-BUILD-001 (OM amendment baselined / CLOSED)**                      | [governance/GOV-ENG-BUILD-001/OWNER-ACCEPTANCE.md](./governance/GOV-ENG-BUILD-001/OWNER-ACCEPTANCE.md)           |
| **ENG-100A Test Execution scaffolding (Wave 1 baselined / CLOSED)**          | [test-execution/ENG-100A/OWNER-ACCEPTANCE.md](./test-execution/ENG-100A/OWNER-ACCEPTANCE.md)                     |
| **ENG-100B Test Execution Domain (Wave 2 baselined / CLOSED)**               | [test-execution/ENG-100B/OWNER-ACCEPTANCE.md](./test-execution/ENG-100B/OWNER-ACCEPTANCE.md)                     |
| **ENG-100C Test Execution Application (Wave 3 baselined / CLOSED)**          | [test-execution/ENG-100C/OWNER-ACCEPTANCE.md](./test-execution/ENG-100C/OWNER-ACCEPTANCE.md)                     |
| **ENG-100D Test Execution Infrastructure & API (Wave 4 baselined / CLOSED)** | [test-execution/ENG-100D/OWNER-ACCEPTANCE.md](./test-execution/ENG-100D/OWNER-ACCEPTANCE.md)                     |
| **ENG-100E Test Execution Workbench (Wave 5 baselined / CLOSED)**            | [test-execution/ENG-100E/OWNER-ACCEPTANCE.md](./test-execution/ENG-100E/OWNER-ACCEPTANCE.md)                     |
| **ECR-001 Test Execution (ECR baselined / CLOSED)**                          | [test-execution/ECR-001/OWNER-ACCEPTANCE.md](./test-execution/ECR-001/OWNER-ACCEPTANCE.md)                       |
| **CERT-001 Test Execution (Certification baselined / CLOSED)**               | [test-execution/CERT-001/OWNER-ACCEPTANCE.md](./test-execution/CERT-001/OWNER-ACCEPTANCE.md)                     |
| **FREEZE-001 Test Execution (Production baseline frozen / CLOSED)**          | [test-execution/FREEZE-001/OWNER-ACCEPTANCE.md](./test-execution/FREEZE-001/OWNER-ACCEPTANCE.md)                 |
| **RELEASE-001 Test Execution (Production Release baselined / CLOSED)**       | [test-execution/RELEASE-001/OWNER-ACCEPTANCE.md](./test-execution/RELEASE-001/OWNER-ACCEPTANCE.md)               |
| **LIFECYCLE-001 APZ Engineering Lifecycle Standard v1.0 (awaiting Owner)**   | [LIFECYCLE-001/OWNER-SUMMARY.md](./LIFECYCLE-001/OWNER-SUMMARY.md)                                               |
| **Engineering Platform v1 milestone**                                        | [ENGINEERING-PLATFORM-V1-MILESTONE.md](./ENGINEERING-PLATFORM-V1-MILESTONE.md)                                   |
| **Portfolio Foundation Completion (ACCEPTED / CLOSED)**                      | [portfolio/PORTFOLIO-001/OWNER-SUMMARY.md](./portfolio/PORTFOLIO-001/OWNER-SUMMARY.md)                           |
| **Integrated Capability Certification (CERTIFIED / CLOSED)**                 | [test-plans/capability-certification/OWNER-SUMMARY.md](./test-plans/capability-certification/OWNER-SUMMARY.md)   |
| **Capability Freeze (FROZEN / CLOSED)**                                      | [test-plans/freeze/README.md](./test-plans/freeze/README.md)                                                     |
| Workbench Component CERT (closed)                                            | [test-plans/CERT-070A/OWNER-ACCEPTANCE.md](./test-plans/CERT-070A/OWNER-ACCEPTANCE.md)                           |
| Workbench Engineering (accepted / closed)                                    | [test-plans/workbench/OWNER-ACCEPTANCE.md](./test-plans/workbench/OWNER-ACCEPTANCE.md)                           |
| Workbench Engineering Specification (accepted / closed)                      | [test-plans/OES-ENG-070A/OWNER-ACCEPTANCE.md](./test-plans/OES-ENG-070A/OWNER-ACCEPTANCE.md)                     |
| Workbench Architecture (accepted / closed)                                   | [test-plans/OES-ARCH-014/OWNER-ACCEPTANCE.md](./test-plans/OES-ARCH-014/OWNER-ACCEPTANCE.md)                     |
| Infra CERT (closed)                                                          | [test-plans/CERT-060B/OWNER-ACCEPTANCE.md](./test-plans/CERT-060B/OWNER-ACCEPTANCE.md)                           |
| Infra ENG (closed)                                                           | [test-plans/infrastructure/OWNER-ACCEPTANCE.md](./test-plans/infrastructure/OWNER-ACCEPTANCE.md)                 |
| Domain CERT (closed)                                                         | [test-plans/domain-certification/OWNER-ACCEPTANCE.md](./test-plans/domain-certification/OWNER-ACCEPTANCE.md)     |

## Lifecycle gate

```text
CERT-060B CERTIFIED / APPROVED / CLOSED
  → ARCH-014 ACCEPTED / ARCHITECTURE BASELINED / PROGRAMME CLOSED
  → OES-ENG-070A ACCEPTED / ENGINEERING SPECIFICATION BASELINED / CLOSED
  → ENG-070A ACCEPTED / APPROVED / PROGRAMME CLOSED
  → CERT-070A CERTIFIED / APPROVED / CLOSED
  → CERT-080A CERTIFIED / APPROVED / CLOSED · @apzhub/qep-test-plans 1.0.0 CERTIFIED
  → FREEZE-080A FROZEN / APPROVED / CLOSED · @apzhub/qep-test-plans 1.0.0 CERTIFIED / FROZEN / BASELINE ESTABLISHED  ← baseline
```

## STOP

**APZQEP-CERT-080A is CERTIFIED / APPROVED / CLOSED** (see [test-plans/capability-certification/OWNER-ACCEPTANCE.md](./test-plans/capability-certification/OWNER-ACCEPTANCE.md)); `@apzhub/qep-test-plans` was promoted to **1.0.0 CERTIFIED**. **APZQEP-FREEZE-080A is FROZEN / APPROVED / CLOSED** (see [test-plans/freeze/OWNER-FREEZE-DECISION.md](./test-plans/freeze/OWNER-FREEZE-DECISION.md)); `@apzhub/qep-test-plans` **1.0.0 CERTIFIED / FROZEN / BASELINE ESTABLISHED**. No engineering, no remediation, no further Version Promotion, no further Test Plans work under existing identifiers — future work requires a new, separate Owner-authorised programme. Portfolio: Requirements, Traceability, Verification, Test Specifications, Test Plans — all **1.0.0 FROZEN**.

**APZQEP-PORTFOLIO-001 is ACCEPTED / APPROVED / CLOSED** (see [portfolio/PORTFOLIO-001/OWNER-ACCEPTANCE.md](./portfolio/PORTFOLIO-001/OWNER-ACCEPTANCE.md)) — **APZQEP FOUNDATION IS FORMALLY COMPLETE**. **CAPABILITY EXPANSION IS READY. NO WAVE-2 PROGRAMMES ARE AUTHORISED.** Authorised next delivery: **none** under existing identifiers; any Wave 2 capability requires a new, separate Owner-authorised Architecture programme.

**APZQEP-CONSTITUTION v1.0.0 is RATIFIED / APPROVED / BASELINED** (2026-07-28) (see [APZQEP-CONSTITUTION-OWNER-RATIFICATION.md](./APZQEP-CONSTITUTION-OWNER-RATIFICATION.md)) — this document is now the constitutional entry point for APZQEP. **APZQEP FOUNDATION FULLY COMPLETE. ENGINEERING PLATFORM V1. CAPABILITY EXPANSION READY. NO WAVE-2 PROGRAMMES AUTHORISED.** Authorised next delivery: **None.** Wave 2 requires a separate Owner-authorised Architecture programme.
