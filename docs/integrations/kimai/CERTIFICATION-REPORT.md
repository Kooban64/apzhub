# Kimai Integration — Certification Report

> **Programme:** APZHUB-INTEGRATION-KIMAI-002  
> **Title:** Kimai Domain Services Expansion  
> **Package:** `@apzhub/integration-kimai` **0.2.0**  
> **Previous:** **0.1.0** CERTIFIED_FOUNDATION (KIMAI-001)  
> **Status:** **ACCEPTED / CLOSED** — **CERTIFIED_DOMAIN**

---

## Verdict

**CERTIFIED_DOMAIN**

| Dimension                                                      | Result                         |
| -------------------------------------------------------------- | ------------------------------ |
| Integration SDK **1.0.0** compatibility                        | **PASS**                       |
| Foundation ops retained                                        | **PASS**                       |
| Domain CE APIs (timesheets/activities/customers/projects/tags) | **PASS**                       |
| `adapter.core` Plane-style surface                             | **PASS**                       |
| Platform Services domain fallback removed for Kimai path       | **PASS** (`domainMode: kimai`) |
| Search support                                                 | **PARTIAL**                    |
| Tags CE variance                                               | **PARTIAL**                    |
| Approvals / Reporting UI / Analytics / Workbench / APZ Time    | **ABSENT** (correct)           |
| Time HTTP redesign                                             | **ABSENT** (unchanged routes)  |

## Explicit non-deliverables

APZ Time product · Workbench · React · Time HTTP redesign · Platform Service redesign · Approvals · Reporting UI · Analytics · Notifications

## Quality evidence

| Gate                        | Result              |
| --------------------------- | ------------------- |
| Kimai typecheck / lint      | PASS                |
| Kimai tests                 | PASS (**29**)       |
| Platform Time service tests | PASS                |
| Time HTTP regression        | PASS (**6**)        |
| Integration SDK version     | **1.0.0** unchanged |
