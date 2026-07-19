# APZ Time — Implementation Gaps (Reassessment)

> **Programme:** APZHUB-TIME-READINESS-001 (historical)  
> **Classification:** DOCUMENTATION ONLY  
> **Related:** [Reassessment](./APZ-TIME-IMPLEMENTATION-READINESS-REASSESSMENT.md) · Prior [1.0 Gap Analysis](./APZ-TIME-1.0-GAP-ANALYSIS.md)  
> **Date:** 2026-07-19  
> **Rule:** Gaps from repository evidence only  
> **Supersession:** APZHUB-TIME-READINESS-002 closed IR-01/IR-02 and promoted APZ Time to **Implementation Ready**. See [Final Assessment](./APZ-TIME-FINAL-READINESS-ASSESSMENT.md) for current gap disposition. This register remains historical evidence.

---

## Gap register

| ID    | Gap                                                                             | Class                                                               | Blocks IR?                                        | Status vs prior G-*                                | Evidence                                                                                                            |
| ----- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------- | ------------------------------------------------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| IR-01 | Kimai CE **domain** APIs absent (timesheets/activities/customers/projects/tags) | **Critical**                                                        | **Yes**                                           | Evolution of G-01 — foundation closed; domain open | Kimai CERTIFIED_FOUNDATION; rest client `/ping`+`/version` only; limited domain → `PROVIDER_CAPABILITY_UNSUPPORTED` |
| IR-02 | Production Time domain path returns HTTP **501** under Kimai                    | **Critical**                                                        | **Yes**                                           | Consequence of IR-01                               | HTTP-API-CERTIFICATION LIMITED; OpenAPI 1.10.0                                                                      |
| IR-03 | Time module manifest + Activity Bar / workspace navigation absent               | **Critical**                                                        | **Yes** (product IR honesty / D1.5)               | Was G-04                                           | No `modules/time`; no nav contribution                                                                              |
| IR-04 | Product permission registration / provisioning enablement incomplete            | **High**                                                            | **Yes** soft→hard for product IR                  | Was G-04/G-13                                      | Platform `time.*` catalogue exists; product enablement not registered                                               |
| IR-05 | APZ Time Workbench / typed client / React product UI absent                     | **Critical** for Release 1.0 · **No** for IR (Projects deferred UI) | **No** for IR · **Yes** for P1 product release    | Was G-05                                           | No `apps/web/lib/time` product Workbench                                                                            |
| IR-06 | ADR for Kimai **domain** expansion not filed/accepted                           | **High**                                                            | **Yes** before domain adapter work                | Was G-06 (partially addressed for foundation)      | Foundation programme closed; domain ADR not on disk                                                                 |
| IR-07 | Product Playwright / release certification absent                               | **High**                                                            | **Yes** for Production release · soft for IR mark | Was G-07                                           | Layer tests exist; no APZ Time product cert                                                                         |
| IR-08 | Platform Search provider / publication for Time absent                          | **Medium**                                                          | **No** if Phase later                             | Was G-08                                           | Foundation HTTP search composition only                                                                             |
| IR-09 | Reporting UI / exports / analytics hooks absent                                 | **Medium**                                                          | **No** if Phase later                             | Was G-09/G-15                                      | Reporting foundation endpoints only                                                                                 |
| IR-10 | Approvals workflow absent                                                       | **Medium**                                                          | **No** if Phase later                             | Was G-10                                           | CAPABILITIES planned                                                                                                |
| IR-11 | Entity mapping / Projects linking model incomplete for product                  | **Medium**                                                          | Soft                                              | Was G-11                                           | Time projects `tproj_*` ≠ Plane `proj_*`                                                                            |
| IR-12 | Product audit/events (`time.*` event manifests) incomplete                      | **Medium**                                                          | Soft for thin IR                                  | Was G-14                                           | Platform Event SDK available; Time events not productised                                                           |
| IR-13 | Pack / roadmap / PRODUCTS-003 matrix stale vs delivered stack                   | **Medium**                                                          | Soft (docs)                                       | New                                                | Addressed by this programme’s doc updates                                                                           |
| IR-14 | Host Kimai ≠ APZHUB adapter completeness                                        | **Low**                                                             | **No**                                            | Was G-16                                           | ENVIRONMENT.md coexistence                                                                                          |
| IR-15 | In-memory domain mode is test/non-prod only                                     | **High**                                                            | **Yes** if treated as Production SoR              | New honesty gap                                    | Bootstrap `APZHUB_TIME_DOMAIN_MODE=in_memory` forbidden in production                                               |

---

## Closed since planning assessment (do not re-open as Critical)

| Prior                                           | Closure                                                |
| ----------------------------------------------- | ------------------------------------------------------ |
| G-01 foundation adapter                         | APZHUB-INTEGRATION-KIMAI-001 **ACCEPTED**              |
| G-02 platform services (contracts/service.yaml) | APZHUB-PLATFORM-TIME-001 **ACCEPTED** (limited domain) |
| G-03 Time HTTP                                  | APZHUB-TIME-HTTP-001 **ACCEPTED** (limited domain)     |

---

## Critical path to Implementation Ready

```text
Owner-approved Kimai DOMAIN expansion (CE timesheet/activity/customer/project/tag APIs)
  + ADR for domain mapping
  → Platform Services consume real Kimai domain (retire limited-provider for prod path)
  → Time HTTP domain CRUD succeeds against Kimai (not 501)
  → Module manifest + permissions + navigation registration
  → Update IMPLEMENTATION-READINESS.md → Implementation Ready
  → (then) Owner Approval of APZ Time Product Release / Workbench programme
```

Workbench alone does **not** close IR. Domain-capable SoR path does.

---

## Non-gaps (available platform)

| Capability                            | Status               |
| ------------------------------------- | -------------------- |
| Platform Foundation CLOSED            | Available            |
| Integration SDK **1.0.0** frozen      | Available            |
| BetterAuth / AuthZ / Request Pipeline | Available            |
| Workbench shell / Design System       | Available            |
| QA-002 PRODUCTION READY               | Held                 |
| Time HTTP OpenAPI **1.10.0**          | Available (limited)  |
| Time Platform Services **0.26.0**     | Available (limited)  |
| Kimai foundation **0.1.0**            | Available (ops only) |
