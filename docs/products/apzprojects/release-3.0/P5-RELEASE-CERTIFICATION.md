# P5 — Release Certification Pack (APZ Projects Release 3.0)

| Field        | Value                                                                                                 |
| ------------ | ----------------------------------------------------------------------------------------------------- |
| Gate         | **P5 – Full Certification**                                                                           |
| Prerequisite | **P4 CLOSED** (all env PASS)                                                                          |
| Status       | **CLOSED** — Owner accepted; remaining activities execute in Hardening                                |
| Authority    | Owner dual-track closeout · CERTIFY MODE                                                              |
| Objective    | Evidence pack sufficient to enter Phase 3 Hardening and declare Production Ready after Hardening exit |

---

## Certification dimensions

| Dimension        | Artefact                                                                         | Status                   | Evidence                                                                                                               |
| ---------------- | -------------------------------------------------------------------------------- | ------------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| Functional       | [P5-FUNCTIONAL-MATRIX.md](./P5-FUNCTIONAL-MATRIX.md)                             | **PASS**                 | W002–W011 mapped to closed PX-01–PX-07                                                                                 |
| API              | Projects platform route inventory + handler suites                               | **PASS (prep)**          | Routes under `/api/v1/projects/**`; service unit tests green for governance/admin/productivity/reporting/collaboration |
| UI               | Workspace · Portfolio · Teams · Collaboration · Reporting · Productivity · Admin | **PASS (prep)**          | Implemented views wired in `projects-workspace-router.tsx`; live smoke → Hardening                                     |
| Accessibility    | WCAG AA spot-check plan                                                          | **DEFERRED → Hardening** | Mandatory Hardening activity; not a P5 functional blocker when PE closed                                               |
| Performance      | Workspace · Search · Report budgets                                              | **DEFERRED → Hardening** | Mandatory Hardening activity                                                                                           |
| Security         | Authz · tenant isolation · secrets · headers                                     | **PASS (prep)**          | RLS migrations verified (P4); API `withPlatformApiAuth`; secrets not in repo                                           |
| Migration        | [P4-MIGRATION-VERIFICATION.md](./P4-MIGRATION-VERIFICATION.md)                   | **PASS**                 | P4 CLOSED                                                                                                              |
| End-to-End       | Playwright critical journeys                                                     | **DEFERRED → Hardening** | Suite exists; full regression in Hardening                                                                             |
| Release Evidence | [P5-RELEASE-EVIDENCE-CHECKLIST.md](./P5-RELEASE-EVIDENCE-CHECKLIST.md)           | **IN PROGRESS**          | Build/tag/freeze after Hardening                                                                                       |

---

## Environment matrix

| Environment    | P4                       | Certification readiness         | Result               |
| -------------- | ------------------------ | ------------------------------- | -------------------- |
| Dev            | **PASS**                 | Schema + PE baseline            | **PASS**             |
| Test           | **PASS**                 | Schema verified                 | **PASS**             |
| Staging        | **PASS** (schema target) | App host not running — recorded | **PASS** (migration) |
| Prod-Readiness | **PASS**                 | Schema verified                 | **PASS**             |

---

## Automated evidence (executed 2026-08-07)

| Suite                      | Command                                            | Result       |
| -------------------------- | -------------------------------------------------- | ------------ |
| P4 inventory               | `vitest … projects-migration-verification.test.ts` | PASS         |
| P4 live verify (all 4 DBs) | `verifyProjectsMigrations`                         | PASS         |
| W010 administration        | `vitest … projects-administration.test.ts`         | PASS         |
| W009 productivity          | `vitest … projects-productivity.test.ts`           | PASS (prior) |
| W008 reporting             | `vitest … projects-reporting.test.ts`              | PASS         |
| W007 collaboration         | `vitest … projects-collaboration.test.ts`          | PASS         |
| W010 / P3 governance       | `vitest … projects-governance.test.ts`             | PASS         |
| Closeout suite (aggregate) | 6 files / 24 tests                                 | **PASS**     |

---

## Exit criteria

| Criterion                                       | Status                                               |
| ----------------------------------------------- | ---------------------------------------------------- |
| Functional matrix complete for W002–W011        | **PASS**                                             |
| P4 attached and green                           | **PASS**                                             |
| Security/migration prep complete                | **PASS**                                             |
| A11y · Perf · Full E2E · Cross-browser · Mobile | **Authorised for Hardening** (Owner: Phase 3)        |
| Zero Critical/High open for PE scope            | Assumed clear entering Hardening — verify in Phase 3 |
| Release package / tag / freeze                  | After Hardening                                      |

**P5 certification preparation is complete. Formal Production Ready declaration follows Phase 3 Hardening exit.**

Related: [HARDENING-PLAN.md](./HARDENING-PLAN.md) · [PRODUCTION-READINESS.md](./PRODUCTION-READINESS.md)
