# APZ Law Platform — Feature Catalogue (Release 1.0)

> **Programme:** APZ-LAW-001  
> **Classification:** DOCUMENTATION ONLY  
> **Date:** 2026-07-19  
> **Authority:** [RELEASE-1.0-DEFINITION.md](./RELEASE-1.0-DEFINITION.md) · LAW disk surfaces · Definition Pack CAPABILITIES

---

## Legend

| Tag   | Meaning                                      |
| ----- | -------------------------------------------- |
| **F** | Foundation on disk (LAW programmes / app)    |
| **P** | Planned for commercial Release 1.0 packaging |
| **L** | Later than Release 1.0                       |
| **X** | Explicitly excluded from Release 1.0         |

---

## Catalogue

| ID          | Feature                          | Tag             | Notes                                                               |
| ----------- | -------------------------------- | --------------- | ------------------------------------------------------------------- |
| LAW-MTR-01  | Matters                          | **F** / **P**   | Matter workspace · workflows                                        |
| LAW-CLT-01  | Clients                          | **F** / **P**   | Client lifecycle                                                    |
| LAW-DOC-01  | Law Documents                    | **F** / **P**   | In-Law document management (native)                                 |
| LAW-TSK-01  | Tasks                            | **F** / **P**   | Matter-adjacent tasks                                               |
| LAW-TIM-01  | Time entries                     | **F** / **P**   | Time capture                                                        |
| LAW-BIL-01  | Billing / invoices               | **F** / **P**   | In-Law billing; FIN-001 deferred                                    |
| LAW-CAL-01  | Calendar                         | **F** / **P**   | In-app calendar events                                              |
| LAW-TRU-01  | Trust Accounting                 | **F** / **P**   | LAW-015 closed                                                      |
| LAW-SRCH-01 | Legal search                     | **F** / **P**   | Knowledge / search surfaces                                         |
| LAW-DSH-01  | Dashboard                        | **F** / **P**   | Executive / ops dashboard surfaces                                  |
| LAW-RPT-01  | Reports                          | **F** / **P**   | law-reports manifest                                                |
| LAW-ADM-01  | Administration                   | **F** / **P**   | law-administration                                                  |
| LAW-IAM-01  | Permissions / AuthZ              | **F**           | OBS-LAW-01 closed (APZHUB-1.1-001)                                  |
| LAW-EVT-01  | Events / outbox patterns         | **F** / **P**   | Publish legal.* events                                              |
| LAW-NTF-01  | Notifications (platform ENF)     | **F**           | Durable platform session store (OBS-LAW-02 closed — APZHUB-1.1-002) |
| LAW-ACT-01  | Activity / timeline              | **F**           | Durable platform session store (OBS-LAW-02 closed — APZHUB-1.1-002) |
| LAW-API-01  | LAW OpenAPI v1                   | **F** / **P**   | Spec + collections                                                  |
| LAW-APP-01  | Law Platform app                 | **F** / **P**   | `apps/law-platform`                                                 |
| LAW-PKG-01  | Commercial SemVer **1.0.0** pack | **P**           | Absent today                                                        |
| LAW-INT-ID  | Identity                         | **F** / **P**   | BetterAuth + platform IAM                                           |
| LAW-INT-WF  | Workflow (platform product)      | **L** / partial | In-app lifecycles exist; APZ Workflow product adjacency later       |
| LAW-INT-DOC | APZ Documents product            | **L** / partial | Law has native docs; cross-product packaging later                  |
| LAW-INT-AN  | Analytics                        | **L** / partial | Law reports exist; Metabase Analytics product separate              |
| LAW-INT-PRJ | Projects                         | **L** / partial | Optional adjacency; not core Law SoR                                |
| LAW-INT-EML | Email product                    | **X** / **L**   | Not evidenced as Law email SoR                                      |
| LAW-FIN-01  | Shared Financial Engine          | **X**           | FIN-001 deferred                                                    |
| LAW-PRA-01  | Practice-area specialty SKUs     | **L**           | Not productised on disk                                             |
| LAW-EXT-01  | Court e-filing / external DMS    | **L**           | Historical Phase 2+                                                 |

---

## Document management strategy (Release 1.0)

| Principle                     | Planning rule                                                                                                           |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| SoR                           | Law Documents are part of the **native Law** product SoR (not Plane-backed)                                             |
| Relationship to APZ Documents | Cross-product integration is **optional / later**; do not require Documents **1.0.0** packaging as a Law SoR dependency |
| UI                            | Users see Law document surfaces inside Law Platform                                                                     |
| Binary / vault                | Packaging must document actual storage/persistence mode and any placeholder vault debt honestly                         |

---

## Workflow usage (Release 1.0)

| Layer                      | Planning rule                                                                                                      |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| In-product lifecycles      | Matter / document / task / invoice / calendar / trust workflows in `apps/law-platform` are **in scope** to package |
| APZ Workflow product (n8n) | **Not** a Release 1.0 hard dependency; future event-driven automation only via Platform Services                   |
| Modules                    | Never implement parallel workflow engines                                                                          |

---

## Analytics requirements (Release 1.0)

| Layer                      | Planning rule                                                           |
| -------------------------- | ----------------------------------------------------------------------- |
| In-Law reports / dashboard | Package existing law-reports / dashboard surfaces                       |
| APZ Analytics (Metabase)   | **Optional / later** — do not embed Metabase branding in Law UI         |
| Trust / billing analytics  | Trust reporting services on disk may be packaged with Trust limitations |

---

## Identity and authorization model

| Rule       | Detail                                                                                                                 |
| ---------- | ---------------------------------------------------------------------------------------------------------------------- |
| AuthN      | BetterAuth (authentication only)                                                                                       |
| AuthZ      | APZHUB PermissionService / platform-authorization — server authoritative                                               |
| Superadmin | Explicit tier, audited — not a bypass                                                                                  |
| OBS-LAW-01 | **Closed** — APZHUB-1.1-001 (Awaiting Acceptance)                                                                      |
| Tenant     | Tenant isolation goals; auth tenant claim placeholder noted in readiness — packaging must not claim false completeness |
| Roles      | Platform permissions → never expose backend engine role names                                                          |

---

## Release 1.0 cut line

Commercial **1.0.0** shall claim only features that are implemented, permission-gated, covered by certification evidence, and documented in Known Limitations where residual.
