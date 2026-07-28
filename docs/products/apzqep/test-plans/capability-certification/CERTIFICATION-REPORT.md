# Certification Report — APZQEP-CERT-080A

| Field                      | Value                                                                                                                                          |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Programme                  | **APZQEP-CERT-080A**                                                                                                                           |
| Title                      | Test Plans Integrated Capability Certification                                                                                                 |
| Package                    | `@apzhub/qep-test-plans` **1.0.0 CERTIFIED** (Domain + Infrastructure + Workbench all Component-CERTIFIED, now integrated at Capability level) |
| Status                     | **CERTIFIED / APPROVED / CLOSED**                                                                                                              |
| Certification level        | **Capability Certification** (end-to-end) — not a further Component Certification                                                              |
| Class                      | **PRODUCTION_READY_WITH_LIMITATIONS**                                                                                                          |
| Version                    | Promoted **0.2.0 → 1.0.0** per Owner Certification Decision — **APPLIED** (see [VERSION-PROMOTION.md](./VERSION-PROMOTION.md))                 |
| Outcome                    | **PASS** — Owner Certification Decision recorded: **CERTIFIED / APPROVED / CLOSED** (see [OWNER-ACCEPTANCE.md](./OWNER-ACCEPTANCE.md))         |
| Nature                     | Independent assurance — no engineering, no remediation, no behavioural code changes                                                            |
| Date                       | 2026-07-28                                                                                                                                     |
| Evidence                   | `docs/operations/evidence/portfolio-recert/20260728T081500Z-APZQEP-CERT-080A.json`                                                             |
| Independence               | [OES-CERTIFICATION-INDEPENDENCE.md](../../../../engineering/oes/OES-CERTIFICATION-INDEPENDENCE.md)                                             |
| Levels                     | [OES-CERTIFICATION-LEVELS.md](../../../../engineering/oes/OES-CERTIFICATION-LEVELS.md)                                                         |
| CERT-070A Owner Acceptance | [../CERT-070A/OWNER-ACCEPTANCE.md](../CERT-070A/OWNER-ACCEPTANCE.md) — **CERTIFIED / APPROVED / CLOSED** (2026-07-28)                          |
| CERT-060B Owner Acceptance | [../CERT-060B/OWNER-ACCEPTANCE.md](../CERT-060B/OWNER-ACCEPTANCE.md) — **CERTIFIED / APPROVED / CLOSED**                                       |
| CERT-060A Owner Acceptance | [../domain-certification/OWNER-ACCEPTANCE.md](../domain-certification/OWNER-ACCEPTANCE.md) — **CERTIFIED / APPROVED / CLOSED**                 |

## Scope statement

This is **Capability Certification** — the fourth and final certification gate for the Test Plans capability, assessing Domain, Infrastructure, and Workbench **together, end-to-end**, as a single capability, for the first time. It is distinct from and builds upon the three preceding independent Component Certifications:

| Layer          | Programme        | Result                                                                                                                                                           |
| -------------- | ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Domain         | APZQEP-CERT-060A | **CERTIFIED / APPROVED / CLOSED** — `@apzhub/qep-test-plans` **0.1.0 CERTIFIED** — **DOMAIN_PRODUCTION_READY_WITH_LIMITATIONS**                                  |
| Infrastructure | APZQEP-CERT-060B | **CERTIFIED / APPROVED / CLOSED** — `@apzhub/qep-test-plans` **0.2.0 INFRASTRUCTURE COMPONENT CERTIFIED** — **INFRASTRUCTURE_PRODUCTION_READY_WITH_LIMITATIONS** |
| Workbench      | APZQEP-CERT-070A | **CERTIFIED / APPROVED / CLOSED** — `@apzhub/qep-test-plans` **0.2.0 WORKBENCH COMPONENT CERTIFIED** — **WORKBENCH_PRODUCTION_READY_WITH_LIMITATIONS**           |

Per [OES-CERTIFICATION-LEVELS.md](../../../../engineering/oes/OES-CERTIFICATION-LEVELS.md), Capability Certification is the gate at which capability-level production language (`PRODUCTION_READY_WITH_LIMITATIONS`, without a layer qualifier) and SemVer **1.0.0** become appropriate — precisely the pattern already established for Test Specifications under **APZQEP-CERT-050D**.

## Decision (Owner Decision recorded — CERTIFIED)

**PRODUCTION_READY_WITH_LIMITATIONS**

### Rationale

The Test Plans capability, comprising the certified Domain (0.1.0), certified Infrastructure (0.2.0), and certified Workbench (0.2.0), integrates correctly end-to-end: the Domain's lifecycle and policy invariants are preserved unmodified through Infrastructure's persistence/REST/permission layer and are the sole authority behind the Workbench's `availableActions`-gated presentation. No layer duplicates another's responsibility; no layer was found to bypass another. The capability satisfies the APZ QEP production standard for a first stable SemVer baseline, consistent with the precedent established by CERT-050D for Test Specifications. Recorded limitations (L-01 Compare deferred, L-02 items-on-DTO, L-03 coverage, P-01…P-04 test-authoring breadth) are inherited scope-definitions, not correctness defects, and do not force `CERTIFICATION_FAILED`.

| Outcome                           | Why not selected                                                                                          |
| --------------------------------- | --------------------------------------------------------------------------------------------------------- |
| PRODUCTION_READY (no limitations) | Recorded limitations (L-01, L-02, L-03, P-01…P-04) remain material to the capability surface              |
| CERTIFICATION_FAILED              | No mandatory capability gate failed; no cross-layer contract violation found; no remediation ENG required |
| CONDITIONAL PASS                  | No blocking condition requiring a deferred Owner waiver was identified                                    |

## Governance compliance

| Standard / Practice                                           | Result                                                                                                        |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Document 000 v1.0.0                                           | **PASS**                                                                                                      |
| OES-000 v1.0.0                                                | **PASS**                                                                                                      |
| OES-001 v1.0.0                                                | **PASS**                                                                                                      |
| OES-002 v1.1.0 (incl. ECR discipline at each preceding layer) | **PASS**                                                                                                      |
| OES-CERTIFICATION-INDEPENDENCE                                | **PASS** — no engineering performed under CERT-080A                                                           |
| OES-CERTIFICATION-LEVELS                                      | **PASS** — Capability Certification correctly distinguished from the three preceding Component Certifications |

## Baseline completeness

| Baseline                                                                   | Result                                                   |
| -------------------------------------------------------------------------- | -------------------------------------------------------- |
| APZQEP-ARCH-013 (Test Plans Capability Architecture)                       | **ACCEPTED / ARCHITECTURE BASELINED / CLOSED**           |
| APZQEP-OES-ENG-060A / ENG-060A / CERT-060A (Domain)                        | **ACCEPTED / CERTIFIED / CLOSED**                        |
| APZQEP-OES-ENG-060B / ENG-060B / CERT-060B (Infrastructure)                | **ACCEPTED / CERTIFIED / CLOSED**                        |
| APZQEP-ARCH-014 (Workbench Architecture)                                   | **ACCEPTED / ARCHITECTURE BASELINED / PROGRAMME CLOSED** |
| APZQEP-OES-ENG-070A / ENG-070A / CERT-070A (Workbench)                     | **ACCEPTED / CERTIFIED / CLOSED**                        |
| No open engineering, no open Owner Decision, under any consumed identifier | **CONFIRMED**                                            |

## Cross-layer architecture integration

See [ARCHITECTURE-REVIEW.md](./ARCHITECTURE-REVIEW.md) for the full cross-layer review. Summary:

| Check                                                                                                                                             | Result   |
| ------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| Domain lifecycle/policy invariants unmodified end-to-end                                                                                          | **PASS** |
| Infrastructure consumes Domain exclusively via ports (no reimplementation)                                                                        | **PASS** |
| Workbench consumes Infrastructure exclusively via `/api/v1/qep/plans/*` REST (no direct Domain/DB access)                                         | **PASS** |
| `availableActions` computed once (Domain/Application), transported unmodified through Infrastructure DTO, rendered as sole authority by Workbench | **PASS** |
| No layer duplicates another layer's business rules                                                                                                | **PASS** |
| No architectural drift vs ARCH-013 / ARCH-014 / OES-ENG-060A / OES-ENG-060B / OES-ENG-070A                                                        | **PASS** |

## Consolidated engineering evidence

See [ENGINEERING-REVIEW.md](./ENGINEERING-REVIEW.md). All three engineering streams (ENG-060A Domain, ENG-060B Infrastructure, ENG-070A Workbench) are **ACCEPTED / APPROVED / CLOSED** with no open conditions.

## Lifecycle completeness

| Transition                                                | Domain policy             | Infrastructure endpoint   | Workbench surface                                                     |
| --------------------------------------------------------- | ------------------------- | ------------------------- | --------------------------------------------------------------------- |
| Draft → Submitted (`submit`)                              | **PASS**                  | **PASS**                  | **PASS**                                                              |
| Submitted → Approved/Rejected (`approve`/`reject`)        | **PASS**                  | **PASS**                  | **PASS**                                                              |
| Rejected → Draft (returnToDraft)                          | **PASS** (Domain-level)   | **PASS**                  | **PASS**                                                              |
| Approved → Ready (`ready`)                                | **PASS**                  | **PASS**                  | **PASS**                                                              |
| Ready → In Execution (`execute`)                          | **PASS**                  | **PASS**                  | **PASS** (P-01: not separately Playwright-asserted, mechanism proven) |
| In Execution → Completed (`complete`)                     | **PASS**                  | **PASS**                  | **PASS** (P-01)                                                       |
| Completed → Archived (`archive`)                          | **PASS**                  | **PASS**                  | **PASS** (P-01)                                                       |
| Any → Cancelled (`cancel`)                                | **PASS**                  | **PASS**                  | **PASS**                                                              |
| Clone / Supersede                                         | **PASS**                  | **PASS**                  | **PASS** (P-01)                                                       |
| Assign / Schedule (`updateAssignment` / `updateSchedule`) | **PASS**                  | **PASS**                  | **PASS**                                                              |
| Version comparison (Compare)                              | **N/A — deferred (L-01)** | **N/A — deferred (L-01)** | Governed unavailable slot — **PASS** (honest, no fabrication)         |

No lifecycle transition was found to be reachable in the Workbench without being present in the Domain/Infrastructure `availableActions` contract, and no transition present in the Domain was found unreachable end-to-end (with the single, previously-recorded exception of Compare, deferred at Infrastructure as L-01 and honestly represented, not fabricated, at the Workbench).

## Security and permission flow (`qep.plan.*`)

See [SECURITY-REVIEW.md](./SECURITY-REVIEW.md). Summary: **PASS** — permissions enforced server-side at the Application/Platform Service layer; the Workbench renders only what `availableActions` authorises; no client-invented privileged transition found at any layer.

## Audit and observability

See [OPERATIONAL-READINESS.md](./OPERATIONAL-READINESS.md) and [ENGINEERING-REVIEW.md](./ENGINEERING-REVIEW.md). Audit trail (Platform audit + append-only history), domain events, search projection, and Workbench telemetry hooks are present and consistent across layers.

## Documentation completeness

| Pack                                                            | Result       |
| --------------------------------------------------------------- | ------------ |
| `domain-certification/`                                         | **COMPLETE** |
| `infrastructure/` + `CERT-060B/`                                | **COMPLETE** |
| `OES-ARCH-014/` + `OES-ENG-070A/` + `workbench/` + `CERT-070A/` | **COMPLETE** |
| `capability-certification/` (this pack)                         | **COMPLETE** |
| Cross-references consistent across all packs                    | **PASS**     |

## Test evidence (independently re-verified by CERT-080A)

See [TEST-RESULTS.md](./TEST-RESULTS.md) for full detail. Summary:

| Command                                                                                                                                                | Result                                                                                                                                                                                                                  |
| ------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm exec vitest run packages/qep-test-plans apps/web/components/qep/qep-test-plan-views.test.tsx apps/web/lib/api/v1/handlers/qep-test-plan.test.ts` | **124 / 124 PASS** (11 test files)                                                                                                                                                                                      |
| `pnpm --filter @apzhub/qep-test-plans typecheck`                                                                                                       | **PASS**                                                                                                                                                                                                                |
| Playwright E2E spec                                                                                                                                    | **PRESENT** — `testing/playwright/e2e/apzqep-eng-070a-test-plans-workbench.spec.ts` (495 lines) — reviewed, not re-executed (browser E2E execution is an operational/CI concern, not a certification re-implementation) |

No test failure was found. No FINDING is recorded against the test suite.

## Quality gates (aggregate)

See [QUALITY-GATES.md](./QUALITY-GATES.md) for the full matrix. **ALL MANDATORY CAPABILITY GATES PASS** (class carries limitations L-01, L-02, L-03, P-01…P-04).

## Performance

See [PERFORMANCE-REVIEW.md](./PERFORMANCE-REVIEW.md). **PASS** — bounded/paginated queries throughout; no dedicated large-scale load-test campaign performed under this or any preceding programme (consistent with CERT-050D precedent).

## Accessibility

See [ACCESSIBILITY-REVIEW.md](./ACCESSIBILITY-REVIEW.md). **PASS** (WCAG AA intent) — re-cited from `workbench/ACCESSIBILITY.md` and CERT-070A; P-03 (some panels not separately axe-scanned) recorded as scope-defining, not blocking.

## Consolidated known limitations

See [KNOWN-LIMITATIONS.md](./KNOWN-LIMITATIONS.md). Limitations **define scope**; they do **not** force `CERTIFICATION_FAILED`.

| ID                      | Origin                     | Topic                                                                                 |
| ----------------------- | -------------------------- | ------------------------------------------------------------------------------------- |
| L-01                    | Infrastructure (CERT-060B) | Version comparison (`GET .../compare`) not implemented                                |
| L-02                    | Infrastructure (CERT-060B) | Dedicated `GET .../items` not provided; items on Plan DTO                             |
| L-03                    | Infrastructure (CERT-060B) | Package line coverage below aspirational OES % objective (77.07%), justified          |
| P-01…P-04               | Workbench (CERT-070A)      | Presentation-level test-authoring breadth and preference-persistence scope boundaries |
| Domain scope exclusions | Domain (CERT-060A)         | No AI/MCP implementation; capability Freeze/1.0.0 deferred to this programme          |

## Production classification

**PRODUCTION_READY_WITH_LIMITATIONS**

## Version

Promoted to **1.0.0** as CERT packaging per Owner Certification Decision. See [VERSION-PROMOTION.md](./VERSION-PROMOTION.md). **APPLIED.**

## Freeze

**FROZEN / APPROVED / CLOSED.** Freeze was a **separate** Owner Decision (as with CERT-050D → Owner Freeze Decision), executed under **APZQEP-FREEZE-080A** — not under this Certification pack. See [../freeze/README.md](../freeze/README.md), [../freeze/OWNER-FREEZE-DECISION.md](../freeze/OWNER-FREEZE-DECISION.md), and [FREEZE-NOTICE.md](./FREEZE-NOTICE.md). `@apzhub/qep-test-plans` **1.0.0 CERTIFIED / FROZEN / BASELINE ESTABLISHED**.

## Certification independence

| Check                                                                                                                   | Result                                                        |
| ----------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| No production code changed under CERT-080A                                                                              | **PASS**                                                      |
| No React/Next.js edits under CERT-080A                                                                                  | **PASS**                                                      |
| No migrations under CERT-080A                                                                                           | **PASS**                                                      |
| No remediation of L-01, L-02, L-03, or P-01…P-04 under CERT-080A                                                        | **PASS**                                                      |
| `package.json` / `module.yaml` version bump to 1.0.0 applied only as CERT packaging, after Owner Certification Decision | **PASS** — see [VERSION-PROMOTION.md](./VERSION-PROMOTION.md) |
| Only re-verification (test/typecheck execution) and documentation performed under CERT-080A itself                      | **PASS**                                                      |

## Evidence

- Assurance: `20260728T081500Z-APZQEP-CERT-080A.json`
- Acceptance: `20260728T090246Z-APZQEP-CERT-080A-ACCEPTANCE.json`
- Upstream: `20260728T073000Z-APZQEP-CERT-070A.json`, `20260728T080924Z-APZQEP-CERT-070A-ACCEPTANCE.json`, `20260728T060500Z-APZQEP-CERT-060B-ACCEPTANCE.json`, `20260727T174500Z-APZQEP-CERT-060A-ACCEPTANCE.json`
- Pack index: [EVIDENCE-PACK.md](./EVIDENCE-PACK.md)
- Permanent release evidence: [docs/releases/apzqep/test-plans/1.0.0/](../../../../releases/apzqep/test-plans/1.0.0/README.md)

## STOP

```text
Programme: APZQEP-CERT-080A
Status: CERTIFIED
APPROVED
CLOSED

Programme: APZQEP-FREEZE-080A
Status: FROZEN
APPROVED
CLOSED

@apzhub/qep-test-plans
1.0.0
CERTIFIED
FROZEN
BASELINE ESTABLISHED
PRODUCTION_READY_WITH_LIMITATIONS

Authorised next delivery: none under existing identifiers — new Owner-authorised programme required
```
