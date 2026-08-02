# Capability Map — APZQEP-140-000

| Field     | Value                       |
| --------- | --------------------------- |
| Programme | APZQEP-140-000              |
| Status    | **COMPLETE** (architecture) |
| Timestamp | 20260802T163547Z            |

Each capability sheet uses the same template. **No implementation.**

---

## Stakeholder streams ↔ capabilities

| Stream (Board)  | Capabilities  |
| --------------- | ------------- |
| Test Management | **A**         |
| Execution       | **B** + **C** |
| Quality         | **D** + **E** |
| Reporting       | **F**         |

---

## Capability A — Test Management

| Field               | Definition                                                                                         |
| ------------------- | -------------------------------------------------------------------------------------------------- |
| Purpose             | Author and organise executable test assets                                                         |
| Scope               | Suites, Cases (within suites/libraries), Parameters, Libraries, Shared Assets, Reusable Components |
| Out of scope        | Run scheduling, live execution, defects                                                            |
| Domain ownership    | `SuiteService` / Test Management domain (`@apzhub/qep-suites` — future)                            |
| Entities            | Suite, SuiteVersion, TestCase, ParameterSet, Library, SharedAsset, ComponentRef                    |
| Commands            | Create/Edit/Clone Suite; Add Case; Manage Library; Pin Suite                                       |
| Events              | `qep.suite.*`, `qep.library.*`                                                                     |
| Read models         | QKI entity kinds: `suite`, (+ case summary fields on suite docs)                                   |
| Processors          | Suite → QKI; Suite → Notifications (subscribers)                                                   |
| Notifications       | Suite published / archived (subscription-driven)                                                   |
| Command Platform    | Navigation + entity open + create suite                                                            |
| Security            | `qep.suites.*`; tenant + project scope                                                             |
| API                 | `/api/v1/qep/suites/*`, `/api/v1/qep/libraries/*`                                                  |
| UI module           | `modules/qep-suites`                                                                               |
| Dependencies        | Project context; Evidence (optional asset links)                                                   |
| AI / QI touchpoints | Future: suite generation assist; coverage QI inputs                                                |

---

## Capability B — Run Management

| Field               | Definition                                                            |
| ------------------- | --------------------------------------------------------------------- |
| Purpose             | Plan, schedule, and assign test runs before/during execution          |
| Scope               | Runs, Execution Planning, Scheduling, Assignments, Execution Sessions |
| Out of scope        | Step-level execution engine internals (Capability C)                  |
| Domain ownership    | `RunService` (`@apzhub/qep-runs` — future)                            |
| Entities            | TestRun, RunPlan, Schedule, Assignment, ExecutionSession              |
| Commands            | Create Run; Schedule; Assign Tester; Open Session; Cancel Run         |
| Events              | `qep.run.*`, `qep.session.*`                                          |
| Read models         | QKI: `run`                                                            |
| Processors          | Run → QKI; assignment → Notifications                                 |
| Notifications       | Run assigned / starting / overdue                                     |
| Command Platform    | Start run; open assigned runs                                         |
| Security            | `qep.runs.*`; assignee visibility rules                               |
| API                 | `/api/v1/qep/runs/*`                                                  |
| UI module           | `modules/qep-runs`                                                    |
| Dependencies        | Suites (A); Projects; Identity                                        |
| AI / QI touchpoints | Future: risk-based run planning                                       |

---

## Capability C — Test Execution

| Field               | Definition                                                                   |
| ------------------- | ---------------------------------------------------------------------------- |
| Purpose             | Execute tests (manual / automated / hybrid) and capture results + evidence   |
| Scope               | Execution sessions, step results, status, evidence linkage, automation hooks |
| Out of scope        | Defect SoR (D); suite authoring (A)                                          |
| Domain ownership    | `ExecutionService` (`@apzhub/qep-test-execution` — evolve existing)          |
| Entities            | Execution, StepResult, ExecutionStatus, EvidenceLink, AutomationJobRef       |
| Commands            | Start/Complete Step; Record Result; Attach Evidence; Abort Execution         |
| Events              | `qep.execution.*` (+ reuse Evidence events)                                  |
| Read models         | QKI: `execution`; Evidence already indexed                                   |
| Processors          | Execution → QKI; completion → Notifications; evidence processors (existing)  |
| Notifications       | Execution completed / failed / blocked                                       |
| Command Platform    | Record pass/fail; attach evidence                                            |
| Security            | `qep.execution.*`; session ownership                                         |
| API                 | `/api/v1/qep/executions/*` (extend existing TE API)                          |
| UI module           | `modules/qep-execution` / Workbench                                          |
| Dependencies        | Runs (B); Evidence Platform; optional automation adapters                    |
| AI / QI touchpoints | Future: failure clustering; flaky signals                                    |

---

## Capability D — Defect & Quality Findings

| Field               | Definition                                                                |
| ------------------- | ------------------------------------------------------------------------- |
| Purpose             | Manage defects, quality findings, and risk signals linked to QE artefacts |
| Scope               | Defect lifecycle, links, findings, risk markers                           |
| Out of scope        | External ALM sync (future adapter programme)                              |
| Domain ownership    | `DefectService` (`@apzhub/qep-defects` — future)                          |
| Entities            | Defect, DefectLink, QualityFinding, RiskSignal                            |
| Commands            | Create Defect; Transition State; Link to Run/Execution/Requirement        |
| Events              | `qep.defect.*`, `qep.finding.*`                                           |
| Read models         | QKI: `defect`                                                             |
| Processors          | Defect → QKI; severity transitions → Notifications                        |
| Notifications       | Critical defect opened; assignment                                        |
| Command Platform    | Create defect from execution context                                      |
| Security            | `qep.defects.*`                                                           |
| API                 | `/api/v1/qep/defects/*`                                                   |
| UI module           | `modules/qep-defects`                                                     |
| Dependencies        | Execution (C); Requirements (E); Evidence                                 |
| AI / QI touchpoints | Future: duplicate detection; risk scoring                                 |

---

## Capability E — Requirements & Traceability

| Field               | Definition                                                                                            |
| ------------------- | ----------------------------------------------------------------------------------------------------- |
| Purpose             | Maintain requirements and end-to-end traceability / coverage                                          |
| Scope               | Requirements, relationships, coverage views, trace matrix                                             |
| Out of scope        | Full ALM replacement                                                                                  |
| Domain ownership    | `RequirementService` / Traceability (`@apzhub/qep-requirements`, `@apzhub/qep-traceability` — evolve) |
| Entities            | Requirement, Relationship, CoverageCell, TracePath                                                    |
| Commands            | Create/Baseline Requirement; Link; Open Trace View                                                    |
| Events              | `qep.requirement.*`, `qep.trace.*`                                                                    |
| Read models         | QKI: `requirement`; derived coverage projections                                                      |
| Processors          | Requirement → QKI; coverage recompute on suite/run/defect events                                      |
| Notifications       | Coverage drop below threshold (policy)                                                                |
| Command Platform    | Open requirement; show coverage                                                                       |
| Security            | `qep.requirements.*`, `qep.traceability.*`                                                            |
| API                 | `/api/v1/qep/requirements/*`, `/api/v1/qep/traceability/*`                                            |
| UI module           | `modules/qep-requirements`, `modules/qep-traceability`                                                |
| Dependencies        | Suites, Runs, Execution, Defects (link targets)                                                       |
| AI / QI touchpoints | Future: gap analysis; QI coverage metrics                                                             |

---

## Capability F — Reporting

| Field               | Definition                                                                       |
| ------------------- | -------------------------------------------------------------------------------- |
| Purpose             | Operational and executive visibility over QE state                               |
| Scope               | Operational dashboards, Executive dashboards, Quality analytics, Portfolio views |
| Out of scope        | Ad-hoc BI warehouse; live backend engine dashboards for end users                |
| Domain ownership    | `ReportingService` (read models only; **no SoR writes**)                         |
| Entities            | ReportDefinition, Dashboard, SavedView, AnalyticSnapshot (derived)               |
| Commands            | Open Dashboard; Save View; Export Report (async job)                             |
| Events              | Consumes only — may emit `qep.report.exported`                                   |
| Read models         | **QKI + analytic projections** only; never query capability SoR for dashboards   |
| Processors          | Optional rollup projections from events                                          |
| Notifications       | Digest subscriptions (via Notification Platform)                                 |
| Command Platform    | Jump to dashboards; export                                                       |
| Security            | Role-aware widgets; `qep.reporting.*`                                            |
| API                 | `/api/v1/qep/reporting/*` (read)                                                 |
| UI module           | `modules/qep-reporting`                                                          |
| Dependencies        | All capabilities’ events / QKI                                                   |
| AI / QI touchpoints | Future: narrative summaries; QI widgets                                          |

---

## Cross-capability integration matrix

| From → To      | Mechanism                                        |
| -------------- | ------------------------------------------------ |
| A → B          | Suite ID reference on Run                        |
| B → C          | Run / Session ID on Execution                    |
| C → Evidence   | EvidenceLink + existing Evidence events          |
| C → D          | Command “Create Defect” with execution context   |
| A/C/D → E      | Relationship edges + coverage projection         |
| A–E → F        | Events → QKI / rollups → Reporting reads         |
| All → Notify   | Domain events / QKI → Notification subscribers   |
| All → Commands | Register handlers + metadata on Command Platform |
