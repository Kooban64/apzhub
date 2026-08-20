# APZQEP Phase 3 — Implementation authority

**Status:** AUTHORISED (this implementation)  
**Date:** 2026-08-19  
**Phase 1 / 1V / 1E / 2:** CLOSED  
**Phase 4:** NOT STARTED

Visual authorities (do not redesign):

| Screen                            | Visual                                                                                                                             | Lock                                                        |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| 1 Test Case Library               | [visuals/phase-3/01-test-case-library-authority.png](./visuals/phase-3/01-test-case-library-authority.png)                         | [SCREEN-1](./APZQEP-PHASE-3-SCREEN-1-TEST-CASE-LIBRARY.md)  |
| 2 Test Case Designer              | [visuals/phase-3/02-test-case-designer-authority.png](./visuals/phase-3/02-test-case-designer-authority.png)                       | [SCREEN-2](./APZQEP-PHASE-3-SCREEN-2-TEST-CASE-DESIGNER.md) |
| 3 Test Suites                     | [visuals/phase-3/03-test-suites-authority.png](./visuals/phase-3/03-test-suites-authority.png)                                     | [SCREEN-3](./APZQEP-PHASE-3-SCREEN-3-TEST-SUITES.md)        |
| 4 Test Plans / Execution Strategy | [visuals/phase-3/04-test-plans-execution-strategy-authority.png](./visuals/phase-3/04-test-plans-execution-strategy-authority.png) | [SCREEN-4](./APZQEP-PHASE-3-SCREEN-4-TEST-PLANS.md)         |

Domain authority: [APZQEP-PHASE-3-DOMAIN-LOCK.md](./APZQEP-PHASE-3-DOMAIN-LOCK.md).  
Reconciliation: [APZQEP-PHASE-3-DOMAIN-RECONCILIATION-REPORT.md](./APZQEP-PHASE-3-DOMAIN-RECONCILIATION-REPORT.md).

This phase **extends** existing QEP aggregates. It does **not** create parallel Test Case / Suite / Plan / Execution stores, Release, SSH/Terminal, Source write, or AI generation.

Illustrative visual data (`TC-*`, sample suites, providers, percentages) is **not** seed data.

## Owner decisions (closed)

1. Keep durable `TS-*` identifiers. UI term is **Test Case**. No `TC-*` aliases.
2. Approve `SUITE-*` for Suites.
3. Additive extension of certified Test Plan 1.0. No Plan v2.
4. Execution Plan is internal/orchestration. Customer IA shows Test Plans only.
5. One customer-facing **Executions** experience over both existing engines.
6. Do not persist Web/API/Repository as Phase 1E execution-target types. Separate verification capability, execution surface, and infrastructure target.

Light and dark use identical geometry. Mobile is a responsive transformation. Counts, membership, strategy, coverage, and results must be honest.
