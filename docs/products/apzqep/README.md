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
> **APZQEP FOUNDATION FULLY COMPLETE** · **ENGINEERING PLATFORM V1** · **CAPABILITY EXPANSION READY** · **NO WAVE-2 PROGRAMMES AUTHORISED**

> **Rule:** CERT-060B, CERT-070A, and CERT-080A are independent assurance only, now CLOSED. ARCH-014, OES-ENG-070A, and ENG-070A are all ACCEPTED / CLOSED. **APZQEP-CERT-080A** (Test Plans Integrated Capability Certification) is **CERTIFIED / APPROVED / CLOSED**; `@apzhub/qep-test-plans` was promoted to **1.0.0**. **APZQEP-FREEZE-080A** (Capability Freeze) is **FROZEN / APPROVED / CLOSED** — see [test-plans/freeze/](./test-plans/freeze/README.md). No further Test Plans work is authorised under existing identifiers; future work requires a new Owner-authorised programme. Portfolio-wide: **APZQEP-PORTFOLIO-001** consolidates all five frozen capabilities into a single Foundation Completion baseline — **ACCEPTED / APPROVED / CLOSED**; APZQEP Foundation is formally complete and Capability Expansion is READY; no Wave 2 programme is authorised. **APZQEP-CONSTITUTION v1.0.0 is RATIFIED / APPROVED / BASELINED** (2026-07-28) — see [APZQEP-CONSTITUTION-OWNER-RATIFICATION.md](./APZQEP-CONSTITUTION-OWNER-RATIFICATION.md). Authorised next delivery: **none** under existing identifiers — any Wave 2 capability (Test Execution, Test Runs, Test Suites, Evidence, Defects, Coverage & Analytics, Reporting, AI-Assisted Testing) requires a new, separate Owner-authorised Architecture programme; do not invent or start one.

## Start here

| Audience                                                     | Document                                                                                                         |
| ------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------- |
| **Everyone (first read)**                                    | [APZQEP-CONSTITUTION.md](./APZQEP-CONSTITUTION.md) **v1.0.0** — **RATIFIED / APPROVED / BASELINED** (2026-07-28) |
| **Engineering Platform v1 milestone**                        | [ENGINEERING-PLATFORM-V1-MILESTONE.md](./ENGINEERING-PLATFORM-V1-MILESTONE.md)                                   |
| **Portfolio Foundation Completion (ACCEPTED / CLOSED)**      | [portfolio/PORTFOLIO-001/OWNER-SUMMARY.md](./portfolio/PORTFOLIO-001/OWNER-SUMMARY.md)                           |
| **Integrated Capability Certification (CERTIFIED / CLOSED)** | [test-plans/capability-certification/OWNER-SUMMARY.md](./test-plans/capability-certification/OWNER-SUMMARY.md)   |
| **Capability Freeze (FROZEN / CLOSED)**                      | [test-plans/freeze/README.md](./test-plans/freeze/README.md)                                                     |
| Workbench Component CERT (closed)                            | [test-plans/CERT-070A/OWNER-ACCEPTANCE.md](./test-plans/CERT-070A/OWNER-ACCEPTANCE.md)                           |
| Workbench Engineering (accepted / closed)                    | [test-plans/workbench/OWNER-ACCEPTANCE.md](./test-plans/workbench/OWNER-ACCEPTANCE.md)                           |
| Workbench Engineering Specification (accepted / closed)      | [test-plans/OES-ENG-070A/OWNER-ACCEPTANCE.md](./test-plans/OES-ENG-070A/OWNER-ACCEPTANCE.md)                     |
| Workbench Architecture (accepted / closed)                   | [test-plans/OES-ARCH-014/OWNER-ACCEPTANCE.md](./test-plans/OES-ARCH-014/OWNER-ACCEPTANCE.md)                     |
| Infra CERT (closed)                                          | [test-plans/CERT-060B/OWNER-ACCEPTANCE.md](./test-plans/CERT-060B/OWNER-ACCEPTANCE.md)                           |
| Infra ENG (closed)                                           | [test-plans/infrastructure/OWNER-ACCEPTANCE.md](./test-plans/infrastructure/OWNER-ACCEPTANCE.md)                 |
| Domain CERT (closed)                                         | [test-plans/domain-certification/OWNER-ACCEPTANCE.md](./test-plans/domain-certification/OWNER-ACCEPTANCE.md)     |

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
