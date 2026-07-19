# Time Platform Services — Certification Report

> **Programme:** APZHUB-PLATFORM-TIME-001  
> **Title:** Canonical Time Platform Services  
> **Packages:** `@apzhub/platform-service-contracts` **0.17.0** · `@apzhub/platform-services` **0.26.0**  
> **Integration:** `@apzhub/integration-kimai` **0.2.0** (KIMAI-002 **ACCEPTED** · CERTIFIED_DOMAIN)  
> **Status:** **ACCEPTED / CLOSED** (Owner 2026-07-19)

---

## Verdict

**CERTIFIED_WITH_LIMITATIONS**

| Dimension                                            | Result                                                                                                                                                                                   |
| ---------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Architecture (Platform Service → Kimai Integration)  | **PASS**                                                                                                                                                                                 |
| Contracts + gateway registration                     | **PASS**                                                                                                                                                                                 |
| Authorization + request pipeline                     | **PASS**                                                                                                                                                                                 |
| Kimai ops consumption (health/diagnostics/readiness) | **PASS**                                                                                                                                                                                 |
| Domain CRUD via Kimai CE                             | **Updated by KIMAI-002** — production path uses `createKimaiDomainProvider` (`domainMode: kimai`) on Kimai **0.2.0**; see [Kimai cert](../../integrations/kimai/CERTIFICATION-REPORT.md) |
| In-memory domain (tests)                             | **PASS**                                                                                                                                                                                 |
| HTTP / Workbench / APZ Time                          | **ABSENT** (correct — out of scope)                                                                                                                                                      |
| Integration SDK freeze                               | **PASS** (unchanged)                                                                                                                                                                     |
| Kimai domain wiring                                  | **PASS** — services **0.26.1** / contracts **0.17.1** consume Kimai **0.2.0** `adapter.core`                                                                                             |

---

## Services delivered

TimeTrackingService · ActivityService · CustomerService · ProjectTimeService · TimesheetService · TagService · TimeReportingService (foundation)

## Explicit non-deliverables

Workbench · HTTP APIs · React · APZ Time product · Reporting UI · Analytics · Exports · Approvals · Notifications
