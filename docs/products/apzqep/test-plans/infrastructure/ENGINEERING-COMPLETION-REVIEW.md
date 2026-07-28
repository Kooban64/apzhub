# Engineering Completion Review (ECR) — APZQEP-ENG-060B

| Field                  | Value                                                                                                        |
| ---------------------- | ------------------------------------------------------------------------------------------------------------ |
| Programme              | **APZQEP-ENG-060B** — Test Plans Infrastructure Engineering                                                  |
| Standard               | [OES-002](../../../../engineering/oes/OES-002-Engineering-Review-and-Acceptance-Standard.md) **v1.1.0** §10A |
| Date                   | 2026-07-27                                                                                                   |
| Decision               | **PASS WITH CONDITIONS**                                                                                     |
| Evidence               | `docs/operations/evidence/portfolio-recert/20260727T193200Z-APZQEP-ENG-060B-ECR-PASS-WITH-CONDITIONS.json`   |
| Completion Report      | [INFRASTRUCTURE-COMPLETION-REPORT.md](./INFRASTRUCTURE-COMPLETION-REPORT.md)                                 |
| Checklist              | [INFRASTRUCTURE-ECR-CHECKLIST.md](./INFRASTRUCTURE-ECR-CHECKLIST.md)                                         |
| Coverage justification | [§ Coverage deviation justification](#coverage-deviation-justification) below                                |
| Conditions             | [§ Conditions](#conditions) below                                                                            |

## Decision

**PASS WITH CONDITIONS**

ENG-060B was declared **READY FOR OWNER ACCEPTANCE** under OES-002 v1.1.0. ECR performed **no** engineering, remediation, or test inflation.

**Subsequent Owner Decision (2026-07-27):** Owner Acceptance Review — **ACCEPTED WITH RECORDED LIMITATIONS / APPROVED / PROGRAMME CLOSED**. See [OWNER-ACCEPTANCE.md](./OWNER-ACCEPTANCE.md). Condition dispositions: C-01 deferred · C-02 approved variance · C-03 accepted · C-04 justification accepted.

### Primary finding (architectural separation)

Business behaviour remains exclusively in the certified Domain (`@apzhub/qep-test-plans` Domain layer / CERT-060A **0.1.0** semantics). Infrastructure implements execution, persistence, integration, and delivery only. Application handlers delegate to Domain commands; no lifecycle/policy/invariant reimplementation was found. This satisfies the Owner Observation that ENG-060B may serve as the **reference Infrastructure implementation** for future orchestration capabilities, subject to the recorded conditions.

---

## Conditions

| ID   | Condition                                                                                                                        | Classification                                                           | Owner options                                                                                       |
| ---- | -------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------- |
| C-01 | `CompareVersions` / `GET /api/v1/qep/plans/{planId}/compare` not implemented                                                     | Incomplete vs OES-ENG-060B Part 3 §5 / Appendix C                        | Accept as known limitation for Component OA, **or** require remediation ENG before unconditional OA |
| C-02 | Dedicated `GET .../items` returns 405; items are returned on `GET` plan DTO                                                      | Path/catalogue variance; behavioural read of items available             | Accept as variance, **or** require dedicated list route                                             |
| C-03 | Lifecycle actions exposed as discrete `POST .../{action}` paths (Specs ENG-050B pattern) rather than `POST .../actions/{action}` | Accepted path-shape variance — Domain mapping identical                  | Accept (recommended), **or** require path reshape                                                   |
| C-04 | Package-scoped line coverage **77.07%** (below ≥95% objective)                                                                   | Justified — see coverage section (Postgres adapter + presentation stubs) | Accept justification (recommended)                                                                  |

Conditions **do not** include Domain mutation, Workbench, or business-rule leakage (those were verified absent).

---

## ECR Checklist (summary)

Full matrix: [INFRASTRUCTURE-ECR-CHECKLIST.md](./INFRASTRUCTURE-ECR-CHECKLIST.md).

| Area                                                   | Result                                                  |
| ------------------------------------------------------ | ------------------------------------------------------- |
| Domain integrity / immutability                        | ✅ PASS                                                 |
| No Infrastructure business rules                       | ✅ PASS                                                 |
| Repository + concurrency + transactions                | ✅ PASS                                                 |
| Persistence schema / migrations / RLS                  | ✅ PASS                                                 |
| Application commands / queries / Domain delegation     | ✅ PASS                                                 |
| REST catalogue (core)                                  | ✅ PASS WITH CONDITIONS (C-01…C-03)                     |
| Search hooks                                           | ✅ PASS                                                 |
| Permissions `qep.plan.*`                               | ✅ PASS                                                 |
| Audit / events / observability (application contracts) | ✅ PASS                                                 |
| Platform factory hook parity with Specs                | ✅ PASS (search upsert wired; same pattern as ENG-050B) |
| Testing / typecheck                                    | ✅ PASS                                                 |
| Coverage vs objectives                                 | ✅ PASS WITH CONDITIONS (C-04)                          |
| Documentation / evidence / indexes                     | ✅ PASS                                                 |
| Workbench / CERT / Freeze                              | ✅ N/A (excluded)                                       |

---

## Behavioural completeness assessment

| Area                                       | Evidence                                                        | Result                                      |
| ------------------------------------------ | --------------------------------------------------------------- | ------------------------------------------- |
| Domain unchanged (additive port only)      | `plan-repository.ts` additive; architecture-boundary tests      | ✅ Complete                                 |
| All Appendix A commands                    | Application service + domain tests + app tests                  | ✅ Complete                                 |
| Aggregate reconstruction                   | Mapper + in-memory contract tests                               | ✅ Complete                                 |
| Optimistic concurrency                     | In-memory + Postgres `save(expectedRevision)`                   | ✅ Complete                                 |
| Migrations 0085/0086 + RLS                 | Present in drizzle + journal                                    | ✅ Complete                                 |
| REST authz wrapping                        | `withPlatformApiAuth` + `qep.plan.*`                            | ✅ Complete                                 |
| Items readable                             | Plan DTO includes items                                         | ✅ Complete (dedicated GET optional — C-02) |
| Version list                               | `GET .../versions`                                              | ✅ Complete                                 |
| Version compare                            | Missing                                                         | ⚠ Condition C-01                            |
| Search / audit / event / observation hooks | Application deps + unit tests; search wired at platform factory | ✅ Complete                                 |
| Restore / soft-delete                      | Correctly absent (OES v1)                                       | ✅ Complete                                 |
| Tests                                      | **99 PASS** package · typecheck **PASS**                        | ✅ Complete                                 |

---

## Coverage deviation justification

### Measured (package-scoped, from `coverage/coverage-summary.json`)

| Metric    | OES objective | Actual                 | Status                   |
| --------- | ------------- | ---------------------- | ------------------------ |
| Lines     | ≥95%          | **77.07%** (2225/2887) | Below — justified (C-04) |
| Functions | ≥95%          | **90.31%** (177/196)   | Below — justified        |
| Branches  | ≥90%          | **84.02%** (489/582)   | Below — justified        |

### Behavioural layers (high coverage)

| Surface                         | Lines      | Functions | Branches                                |
| ------------------------------- | ---------- | --------- | --------------------------------------- |
| `plan-application-service.ts`   | **97.95%** | **100%**  | **95.45%**                              |
| In-memory repository            | **98.7%**  | **100%**  | **90.62%**                              |
| DTO adapter / available-actions | **100%**   | **100%**  | **100%**                                |
| Domain (certified)              | ~86–93%    | high      | residual defensive (CERT-060A accepted) |

### Residual classification

| Location                                     | Uncovered                   | Classification                        | Rationale                                                                                                            |
| -------------------------------------------- | --------------------------- | ------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `infrastructure/postgres/plan-repository.ts` | ~422 lines (~1.63% covered) | Integration / adapter                 | No live DB in unit suite; contract semantics covered by in-memory parity + mapper tests; Specs ENG-050B same pattern |
| `presentation/*.ts`                          | stubs (~83 lines at 0%)     | Out-of-programme / Workbench-adjacent | Workbench excluded from ENG-060B; constants only                                                                     |
| `infrastructure/factories.ts`                | Partial                     | Defensive mode branches               | Production/test factory paths partially exercised                                                                    |
| Domain residuals                             | As CERT-060A                | Defensive                             | Already Owner-accepted at Domain CERT                                                                                |

### ECR determination

**Justified deviation for C-04.** Uncovered mass is Postgres integration + presentation stubs — **not** uncovered Infrastructure business behaviour (none exists) or Domain behaviour. Artificial tests solely to inflate percentages are **not** required.

---

## Fidelity

| Baseline                   | Result                                                                  |
| -------------------------- | ----------------------------------------------------------------------- |
| APZQEP-ARCH-013            | ✅ PASS (API namespace, concurrency, no soft-delete, permissions style) |
| APZQEP-OES-ENG-060A        | ✅ PASS (Domain consumed; no Domain rule changes)                       |
| APZQEP-OES-ENG-060B        | ✅ PASS WITH CONDITIONS (C-01…C-03 catalogue variances)                 |
| Domain **0.1.0 CERTIFIED** | ✅ PASS (immutable behaviour)                                           |

---

## Recommendation for Owner Acceptance

Owner Acceptance Review **may proceed** under OES-002 **PASS WITH CONDITIONS**. Recommended Owner posture:

1. Accept C-03 (discrete action paths) and C-04 (coverage justification) unconditionally.
2. Accept C-02 (items via plan DTO) as known limitation, **or** require a small remediation ENG.
3. Decide C-01 (compare): accept as known limitation for Component OA, **or** require remediation before unconditional Acceptance.

ECR does **not** grant Owner Acceptance, Component Certification, Workbench, Freeze, or Version Promotion.

---

## Effect

```text
Implementation COMPLETE
  → ECR PASS WITH CONDITIONS
  → Owner Acceptance ACCEPTED WITH RECORDED LIMITATIONS / CLOSED
  → READY FOR INFRASTRUCTURE COMPONENT CERTIFICATION
```

## Superseded next action

Owner Acceptance completed. Next named: **APZQEP-CERT-060B** (separate Owner Programme Instruction to begin).

## Explicitly not authorised by ECR alone

- Component Certification execution
- Workbench Engineering
- Capability Certification
- Freeze
- Version Promotion
- Remediation engineering under this ECR identifier
