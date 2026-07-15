# APZ TCMS — User Personas

**Product:** APZ TCMS  
**User-facing module:** Testing & Certification  
**Milestone:** APZTCMS-001  
**Status:** Planning personas — **no implementation** in APZTCMS-001  
**Authority:** [Product Vision](../strategy/APZHUB-APZ-TCMS-Product-Vision.md) · [ADR-0059](../adr/ADR-0059-apz-tcms-native-product-architecture.md)

---

## Explicit exclusions (APZTCMS-001)

Documentation only. No UI, APIs, or role implementation in this milestone. Await **APZTCMS-002**.

---

## Persona summary

| Persona         | Primary goals                                  | Typical TCMS surfaces                 |
| --------------- | ---------------------------------------------- | ------------------------------------- |
| Executive       | Release confidence, risk, certification status | Dashboard, Certification, Reports     |
| QA Lead         | Plan coverage, assign work, gate readiness     | Plans, Suites, Cases, Coverage, Gates |
| Tester          | Execute manual cases, capture evidence         | Cases, Executions, Evidence           |
| Developer       | Link automation results, fix failures          | Automation, Executions, Defects       |
| Project Manager | Traceability to delivery, schedule             | Requirements, Plans, Dashboard        |
| Compliance      | Audit trail, sign-off, regulated evidence      | Certification, Approvals, Audit       |
| Ops             | Health of ingestion workers, storage           | Admin, Ops health (platform)          |
| Support         | Defect / ticket correlation                    | Defects, Support links                |

Permissions are server-authoritative (007). Personas map to permission sets — not to backend engine roles.

---

## 1. Executive

| Field             | Detail                                                              |
| ----------------- | ------------------------------------------------------------------- |
| **Role**          | Business or engineering leadership                                  |
| **Needs**         | At-a-glance release readiness; failed gates; certification outcomes |
| **Does not need** | Case-level editing; runner configuration                            |
| **Key views**     | Dashboard, Certification summary, Reports                           |
| **Success**       | Trust release decisions without opening engine dashboards           |

---

## 2. QA Lead

| Field         | Detail                                                                           |
| ------------- | -------------------------------------------------------------------------------- |
| **Role**      | Owns test strategy for a release or product area                                 |
| **Needs**     | Plans, suite structure, coverage vs requirements/risk, assignment, gate criteria |
| **Key views** | Requirements, Plans, Suites, Cases, Coverage, Quality Gates, Reports             |
| **Success**   | Knows what is tested, what remains, and whether certification can proceed        |

---

## 3. Tester

| Field         | Detail                                                                               |
| ------------- | ------------------------------------------------------------------------------------ |
| **Role**      | Executes manual tests                                                                |
| **Needs**     | Clear steps, expected results, actual capture, evidence upload, blocked/retest flows |
| **Key views** | Cases, Executions (manual), Evidence, Defects                                        |
| **Success**   | Complete assigned runs with auditable evidence and outcomes                          |

---

## 4. Developer

| Field         | Detail                                                                    |
| ------------- | ------------------------------------------------------------------------- |
| **Role**      | Builds product and automated tests                                        |
| **Needs**     | Ingested CI/automation results, failure context, defect links to Projects |
| **Key views** | Automation, Executions, Defects, Coverage                                 |
| **Does not**  | Call Playwright/Vitest from the Testing module UI as engines              |
| **Success**   | Results appear in TCMS; failures are actionable without leaving APZHUB    |

---

## 5. Project Manager (PM)

| Field         | Detail                                                           |
| ------------- | ---------------------------------------------------------------- |
| **Role**      | Delivery ownership                                               |
| **Needs**     | Requirement → test → result traceability; progress against plans |
| **Key views** | Requirements, Plans, Dashboard, Reports                          |
| **Success**   | Traceable quality status tied to Projects work items (refs only) |

---

## 6. Compliance / Quality Assurance Officer

| Field         | Detail                                                                 |
| ------------- | ---------------------------------------------------------------------- |
| **Role**      | Regulated or formal release sign-off                                   |
| **Needs**     | Certification states, approvals, signatures/witnesses, immutable audit |
| **Key views** | Certification, Approvals, Evidence, Reports, Audit                     |
| **Success**   | Defendable certification records; AI never replaces human sign-off     |

---

## 7. Ops / Platform Administrator

| Field         | Detail                                                                         |
| ------------- | ------------------------------------------------------------------------------ |
| **Role**      | Platform operations                                                            |
| **Needs**     | Ingestion worker health, evidence storage health, permission admin for Testing |
| **Key views** | Admin (TCMS), Administration Workspace (platform — 014)                        |
| **Success**   | TCMS components report health; secrets never in TCMS domain tables             |

---

## 8. Support Agent

| Field         | Detail                                                                            |
| ------------- | --------------------------------------------------------------------------------- |
| **Role**      | Customer support / defect triage                                                  |
| **Needs**     | Defect links between test failures and Support tickets                            |
| **Key views** | Defects (read + link), related Executions                                         |
| **Success**   | Cross-module references without module-to-module coupling (via Platform Services) |

---

## Permission-driven experience

| Principle             | Detail                                           |
| --------------------- | ------------------------------------------------ |
| Activity Bar          | **Testing** visible only with module permission  |
| Sidebar views         | Filtered by view-level permissions               |
| Certification actions | Separate permission tier from routine execution  |
| Superadmin            | Explicit platform tier (007) — not a TCMS bypass |
| Prefs vs permissions  | Preferences never grant access (023)             |

Concrete permission catalogue is planned for **APZTCMS-002** (stubs) and refined in later milestones.

---

## Related

- [UI Architecture](../architecture/APZHUB-APZ-TCMS-UI-Architecture.md)
- [Module Catalogue](../architecture/APZHUB-APZ-TCMS-Module-Catalogue.md)
- [Product Vision](../strategy/APZHUB-APZ-TCMS-Product-Vision.md)
