# APZ TCMS — Module Catalogue

**Product:** APZ TCMS  
**Module ID:** `testing`  
**Milestone:** APZTCMS-001  
**Status:** Capability catalogue — **planning only**; no module package or manifests in 001  
**Authority:** [025 Module SDK](../025-module-sdk-module-manifest-module-development-standard.md) · [Reference Architecture](./APZHUB-APZ-TCMS-Reference-Architecture.md) · [ADR-0059](../adr/ADR-0059-apz-tcms-native-product-architecture.md)

---

## Explicit exclusions (APZTCMS-001)

No `module.yaml`, no `/modules/testing` code, no UI. Await **APZTCMS-002** for shell registration and manifests.

---

## Product vs module

| Layer             | Identity                                                                                |
| ----------------- | --------------------------------------------------------------------------------------- |
| Product           | **APZ TCMS**                                                                            |
| Workbench module  | **Testing** (`testing`)                                                                 |
| Certification     | Views and workflows **inside** the Testing module (not a separate Activity Bar product) |
| Platform Services | `TestingService`, `CertificationService`                                                |

One module; multiple capability areas. Never hardcode the module in the shell — registry discovery only (025).

---

## Capability breakdown

| Capability ID           | Name                 | Service owner                           | Summary                                               |
| ----------------------- | -------------------- | --------------------------------------- | ----------------------------------------------------- |
| `testing.dashboard`     | Dashboard            | TestingService                          | Health of plans, runs, gates, certification snapshots |
| `testing.requirements`  | Requirements         | TestingService                          | Requirement CRUD, Project refs, risk links            |
| `testing.plans`         | Test Plans           | TestingService                          | Plan lifecycle and suite composition                  |
| `testing.suites`        | Suites               | TestingService                          | Suite and regression suite management                 |
| `testing.cases`         | Cases & Steps        | TestingService                          | Cases, manual steps, expected results                 |
| `testing.executions`    | Executions           | TestingService                          | Manual + automated execution sessions and runs        |
| `testing.automation`    | Automation ingestion | TestingService                          | Adapter-sourced automation metadata and results       |
| `testing.evidence`      | Evidence             | TestingService                          | Evidence metadata + object-store refs                 |
| `testing.defects`       | Defects              | TestingService                          | DefectLink to Projects/Support                        |
| `testing.coverage`      | Coverage             | TestingService                          | CoverageMetric views and recompute jobs               |
| `testing.certification` | Certification        | CertificationService                    | States, gates, approvals, signatures                  |
| `testing.reports`       | Reports              | TestingService (+ CertificationService) | Formal and operational reports                        |
| `testing.admin`         | Admin                | Both (scoped)                           | Module config stubs, permission mapping display       |

---

## Capability → domain map

| Capability             | Primary entities                                                                              |
| ---------------------- | --------------------------------------------------------------------------------------------- |
| Requirements           | Requirement, Risk, Feature/Epic/Story links                                                   |
| Plans / Suites / Cases | TestPlan, TestSuite, TestCase, TestStep, RegressionSuite                                      |
| Executions             | ManualExecution, AutomatedExecution, TestRun, TestResult                                      |
| Automation             | AutomatedExecution, adapter source metadata, TestResult                                       |
| Evidence               | Evidence, Attachment                                                                          |
| Defects                | DefectLink                                                                                    |
| Coverage               | CoverageMetric, DashboardSnapshot                                                             |
| Certification          | CertificationRecord, CertificationState, QualityGate, Approval, Signature/Witness, AuditEvent |
| Reports                | Derived from domain + snapshots                                                               |
| AI (later)             | AISuggestion (advisory)                                                                       |

---

## Platform contract (every capability)

Per Document 003 / 025, each capability area must eventually satisfy:

| Contract element | Expectation                      |
| ---------------- | -------------------------------- |
| Navigation       | Permission-aware sidebar entries |
| Permissions      | Explicit permission keys         |
| Routes / views   | Workbench-registered             |
| Services         | Via Platform Services only       |
| APIs             | Gateway envelope (010)           |
| Search           | Provider registration (020)      |
| Notifications    | Via events (021)                 |
| Audit            | Service-centralised              |
| Health           | Self-report                      |
| Config           | Platform configuration refs      |
| Tests & docs     | Document 015                     |

---

## Out of module scope

| Concern                             | Owner                        |
| ----------------------------------- | ---------------------------- |
| Running Playwright/Vitest processes | External CI/engines          |
| Adapter certification harness       | Integration SDK (orthogonal) |
| Platform IAM implementation         | Platform Core                |
| Direct engine credentials in module | Forbidden                    |

---

## Phased delivery (planning IDs)

See [APZTCMS-Backlog](../backlog/APZTCMS-Backlog.md). Capability depth increases across APZTCMS-002+; 001 defines the catalogue only.

---

## Related

- [UI Architecture](./APZHUB-APZ-TCMS-UI-Architecture.md)
- [Domain Model](./APZHUB-APZ-TCMS-Domain-Model.md)
- [User Personas](../product/APZHUB-APZ-TCMS-User-Personas.md)
