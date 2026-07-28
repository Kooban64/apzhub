# Programme Metrics — APZQEP-PORTFOLIO-001

Counts derived from `docs/foundation/ACTIVE-BACKLOG.md` (APZ QEP section) and the individual capability packs it indexes, as of 2026-07-28. Figures are a portfolio-level summary, not a re-derivation of any individual pack's own internal metrics (Test coverage, ECR pass rates, etc. remain owned by the respective ENG/CERT packs).

## Programme counts by type, First Capability Wave

| Programme type                                                                 |   Count | Notes                                                                                                |
| ------------------------------------------------------------------------------ | ------: | ---------------------------------------------------------------------------------------------------- |
| Product foundation (Transition / Discovery / Constitution / Definition / Plan) |       6 | APZQEP-TRANSITION-001, DISCOVERY-001, CONSTITUTION-001, DEF-001, DEF-002, PLAN-001                   |
| Architecture (ARCH-*)                                                          |      11 | See [ARCHITECTURE-BASELINE-REGISTER.md](./ARCHITECTURE-BASELINE-REGISTER.md)                         |
| Engineering Specification (OES-ENG-*)                                          |       4 | OES-ENG-050C, OES-ENG-060A, OES-ENG-060B, OES-ENG-070A                                               |
| Engineering (ENG-*)                                                            |      18 | ENG-010, 020A–020F, 030A (2 parts), 030C, 040A–040C, 050A–050C, 060A, 060B, 070A                     |
| Certification — Capability                                                     |       5 | REQ-001, TRACE-001, CERT-040D, CERT-050D, CERT-080A                                                  |
| Certification — Component                                                      |       3 | CERT-060A (Domain), CERT-060B (Infrastructure), CERT-070A (Workbench) — all Test Plans               |
| Freeze Decisions                                                               |       5 | One per capability — see [FROZEN-CAPABILITY-REGISTER.md](./FROZEN-CAPABILITY-REGISTER.md)            |
| **Total named programme identifiers**                                          | **≈52** | Excludes the OES-000/001/002 governance trilogy and practice notes, which sit above capability level |

## Capability delivery depth

| Capability          |    Architecture programmes |                Engineering programmes |                       Certification programmes | Freeze           |
| ------------------- | -------------------------: | ------------------------------------: | ---------------------------------------------: | ---------------- |
| Requirements        |     2 (ARCH-005, ARCH-006) | 7 (ENG-020A–020F, counting 020F once) |                                    1 (REQ-001) | ✅               |
| Traceability        |     2 (ARCH-007, ARCH-008) |       3 (ENG-030A ×2 parts, ENG-030C) |                                  1 (TRACE-001) | ✅               |
| Verification        |     2 (ARCH-009, ARCH-010) |                     3 (ENG-040A–040C) |                                  1 (CERT-040D) | ✅               |
| Test Specifications | 2 (ARCH-011, OES-ARCH-012) |                     3 (ENG-050A–050C) |                                  1 (CERT-050D) | ✅               |
| Test Plans          |     2 (ARCH-013, ARCH-014) |      3 (ENG-060A, ENG-060B, ENG-070A) | 4 (CERT-060A, CERT-060B, CERT-070A, CERT-080A) | ✅ (FREEZE-080A) |

Test Plans required the most certification programmes because it is the **only** capability delivered with the full layered Domain/Infrastructure/Workbench component-certification pattern before Capability Certification — the pattern the rest of the portfolio did not need to exercise, and which is now the validated reference for future capabilities with a comparable multi-layer shape.

## Operating Model validation

**APZOR Engineering Operating Model v1.0** — **FULLY VALIDATED THROUGH PRACTICE**, exercised across all 5 capabilities without bypassing any governance stage. See [ENGINEERING-OPERATING-MODEL-VALIDATION-SUMMARY.md](./ENGINEERING-OPERATING-MODEL-VALIDATION-SUMMARY.md).

## Owner progress estimate (cited from Owner Portfolio Declaration)

| Area                   |    Progress |
| ---------------------- | ----------: |
| Engineering Governance |    **100%** |
| Platform Foundation    |    **100%** |
| Core QA Foundation     |    **100%** |
| First Capability Wave  |    **100%** |
| Overall APZQEP Vision  | **≈55–60%** |

The gap between "First Capability Wave 100%" and "Overall vision ≈55–60%" is precisely the space the indicative Wave 2 roadmap occupies — see [WAVE-2-ROADMAP.md](./WAVE-2-ROADMAP.md).

## STOP

Metrics above summarise existing, closed programmes. No new programme is counted, started, or authorised by this document.
