# APZTCMS-009 — Completion Report

**Milestone:** APZTCMS-009 — Certification Engine  
**Product:** APZ TCMS  
**Date:** 2026-07-12  
**Outcome:** **COMPLETE** — certification lifecycle, configurable gates, advisory recommendations, human approvals, immutable audit  
**Next:** **APZTCMS-010** — **awaiting owner approval**

---

## Executive Summary

APZTCMS-009 delivers the Certification Engine as the authoritative domain workflow for release certification. `@apzhub/testing-contracts` **0.6.0**, `@apzhub/testing-persistence` **0.7.0** (migrations `0027`/`0028`), and `@apzhub/testing-services` **0.5.0** provide `createCertificationEngineServices` with formal state machine, gate evaluation, deterministic recommendations, multi-stage human approvals, evidence linking, validation, and immutable audit/history.

Final approval is always human-authorised. Recommendations are advisory only. No AI, no automatic approval, no HTTP/UI.

---

## Certification Architecture

Ten focused services under `packages/testing-services/src/certification/`, wired as `certification` on `createTestingDomainServices`. Quality/manual readiness services remain input-only.

## Workflow / State Machine

Canonical states Draft→…→Approved/Conditionally Approved/Rejected/Expired/Archived with validated transitions only.

## Quality Gates

Configurable gate definitions + evaluations returning PASS/FAIL/WARNING/N/A/UNKNOWN with reason, evidence, timestamp, evaluator, traceability.

## Recommendation Engine

Advisory codes (`ready_for_review`, `ready_for_approval`, `conditionally_ready`, `not_ready`, `blocked`) — never auto-approves.

## Approval Model

Multi-stage human approvals with `certification.approve` required for final approve; signature/witness placeholders.

## Audit Model

Immutable `testing_certification_audit` + history for transitions, gate evals, approvals, recommendations, overrides.

## Tests

| Suite               | Count   |
| ------------------- | ------- |
| Testing packages    | **213** |
| Certification suite | **17**  |

## Coverage (`src/certification`)

| Area            | Lines       |
| --------------- | ----------- |
| Overall         | **~96.57%** |
| State machine   | **100%**    |
| Gate evaluation | **~97%**    |
| Recommendation  | **100%**    |
| Workflow        | **100%**    |

## Quality Gates (programme)

| Gate                  | Result                           |
| --------------------- | -------------------------------- |
| lint / typecheck      | **PASS**                         |
| tests                 | **PASS** (213)                   |
| coverage              | Certification ≥95%               |
| boundary              | No HTTP/UI/AI auto-approve paths |
| repository regression | **PASS**                         |

## Technical Debt

1. Legacy monolithic `CertificationService` facade remains contract-only (engine uses focused services)
2. Some gates return `unknown` without linked coverage/automation/risk data
3. Signatures/witnesses are placeholders
4. `validation-service` line coverage lower than peers (~75%)

## Recommended APZTCMS-010 scope

**Workbench UI (core views):**

1. Permission-driven Testing & Certification module views
2. Surfaces for plans/cases/executions/certification review — no auto-certify
3. Keep domain engines authoritative; UI is presentation only

Await explicit owner approval before APZTCMS-010.

---

## Deliverable checklist

| Item                                     | Status |
| ---------------------------------------- | ------ |
| Contracts 0.6.0                          | ✅     |
| Persistence 0.7.0 + migrations 0027/0028 | ✅     |
| Services 0.5.0 certification engine      | ✅     |
| Architecture docs pack                   | ✅     |
| Completion report                        | ✅     |
| Foundation stop before 010               | ✅     |
