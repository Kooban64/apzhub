# Domain Model — APZQEP v1.1

Each domain is owned by a Platform Service (user-facing name). Backend engines appear only behind adapters.

**Lifecycle legend:** Draft → Active/InProgress → Terminal (Approved/Sealed/Closed/Cancelled) — domain-specific refinements below.

---

## Domain catalogue

### Projects (context)

| Field            | Definition                                                   |
| ---------------- | ------------------------------------------------------------ |
| Purpose          | Scope QE work to APZHUB Projects (or workspace project refs) |
| Ownership        | ProjectService (platform); QEP consumes project IDs          |
| Responsibilities | Provide project context; never duplicate Plane SoR           |
| Relationships    | All QEP artefacts MAY reference `projectId`                  |
| Lifecycle        | Owned by Projects product                                    |
| APIs             | Existing ProjectService; QEP filters by project              |
| Permissions      | `project.*` + QEP scoped permissions                         |

### Requirements — **v1.0 Complete**

| Field            | Definition                                            |
| ---------------- | ----------------------------------------------------- |
| Purpose          | Authoritative requirement statements & baselines      |
| Ownership        | RequirementService / `@apzhub/qep-requirements`       |
| Responsibilities | CRUD, versioning, baselines, relationships            |
| Relationships    | Trace → Verification, Specs, Plans, Defects, Evidence |
| Lifecycle        | Draft → Review → Approved → Baseline / Superseded     |
| APIs             | `/api/v1/qep/requirements/*`                          |
| Permissions      | `qep.requirements.*`                                  |
| v1.1 delta       | AI analysis overlay; search indexing complete         |

### Planning (Test Plans) — **v1.0 Complete**

| Field         | Definition                                   |
| ------------- | -------------------------------------------- |
| Purpose       | Plan what will be tested for a scope/release |
| Ownership     | TestPlanService / `@apzhub/qep-test-plans`   |
| Relationships | Specs, Suites, Runs, Executions              |
| APIs          | `/api/v1/qep/plans/*`                        |
| Permissions   | `qep.plans.*`                                |
| v1.1 delta    | Link to Suites/Runs; QI coverage inputs      |

### Test Cases (Test Specifications) — **v1.0 Complete**

| Field         | Definition                             |
| ------------- | -------------------------------------- |
| Purpose       | Specify test intent and steps          |
| Ownership     | TestSpecificationService               |
| Relationships | Suites, Plans, Runs, Executions, Trace |
| APIs          | `/api/v1/qep/specifications/*`         |
| Permissions   | `qep.specifications.*`                 |
| v1.1 delta    | AI generation drafts; suite membership |

### Test Suites — **v1.1 New**

| Field            | Definition                                         |
| ---------------- | -------------------------------------------------- |
| Purpose          | Versioned collections of specifications for reuse  |
| Ownership        | TestSuiteService / `@apzhub/qep-test-suites` (new) |
| Responsibilities | Membership, versioning, association to plans       |
| Relationships    | Specs ★; Plans; Runs                               |
| Lifecycle        | Draft → Active → Deprecated → Archived             |
| APIs             | `/api/v1/qep/suites/*`                             |
| Permissions      | `qep.suites.read/create/update/archive`            |

### Test Runs — **v1.1 New**

| Field            | Definition                                                |
| ---------------- | --------------------------------------------------------- |
| Purpose          | Timed instance of executing a plan/suite against a target |
| Ownership        | TestRunService / `@apzhub/qep-test-runs` (new)            |
| Responsibilities | Progress, assignment, result rollup, link executions      |
| Relationships    | Plan/Suite; Executions; Defects; Evidence                 |
| Lifecycle        | Planned → InProgress → Completed / Aborted                |
| APIs             | `/api/v1/qep/runs/*`                                      |
| Permissions      | `qep.runs.*`                                              |

### Test Executions — **v1.0 Partial (LA)**

| Field         | Definition                                        |
| ------------- | ------------------------------------------------- |
| Purpose       | Record execution of a specification instance      |
| Ownership     | TestExecutionService                              |
| Relationships | Runs (v1.1), Plans, Evidence, Defects, Ingestions |
| APIs          | `/api/v1/qep/executions/*`                        |
| Permissions   | `qep.executions.*`                                |
| v1.1 delta    | Run linkage; events; E2E hardening; OpenAPI       |

### Defects — **v1.1 New**

| Field            | Definition                                                        |
| ---------------- | ----------------------------------------------------------------- |
| Purpose          | Native defect lifecycle inside QEP                                |
| Ownership        | DefectService / `@apzhub/qep-defects` (new)                       |
| Responsibilities | States, severity, links to run/execution/req/evidence             |
| Relationships    | Runs, Executions, Requirements, Evidence; optional ALM sync later |
| Lifecycle        | Open → InProgress → Resolved → Verified → Closed / Reopened       |
| APIs             | `/api/v1/qep/defects/*`                                           |
| Permissions      | `qep.defects.*`                                                   |

### Evidence — **v1.0 Partial (LA)**

| Field         | Definition                                           |
| ------------- | ---------------------------------------------------- |
| Purpose       | Capture, classify, seal, retain quality evidence     |
| Ownership     | EvidenceService                                      |
| Relationships | Executions, Defects, Certifications, Releases        |
| APIs          | `/api/v1/qep/evidence/*`                             |
| Permissions   | `qep.evidence.*`                                     |
| v1.1 delta    | Durable StoragePort; ACL on list/search; events; obs |

### Certification — **Product engine 1.2 primary**

| Field         | Definition                                                    |
| ------------- | ------------------------------------------------------------- |
| Purpose       | Formal certification packs & gates (product UI)               |
| Ownership     | CertificationService (new package when authorised)            |
| Relationships | Evidence, Requirements, Runs, QI scores                       |
| Lifecycle     | Proposed → InReview → Certified / Rejected                    |
| APIs          | `/api/v1/qep/certifications/*` (future)                       |
| Permissions   | `qep.certifications.*`                                        |
| Note          | Programme CERT packs already exist; product module stub today |

### Releases (product readiness)

| Field         | Definition                                            |
| ------------- | ----------------------------------------------------- |
| Purpose       | Release readiness views & checkpoints (not git tags)  |
| Ownership     | ReleaseReadinessService (lightweight v1.1; depth 1.2) |
| Relationships | QI Engine, Defects, Runs, Evidence                    |
| APIs          | `/api/v1/qep/release-readiness/*`                     |
| Permissions   | `qep.release.readiness.*`                             |

### Analytics / Quality Intelligence

| Field       | Definition                                                                                          |
| ----------- | --------------------------------------------------------------------------------------------------- |
| Purpose     | Derived quality metrics & trends                                                                    |
| Ownership   | QualityIntelligenceService — see [QUALITY-INTELLIGENCE-ENGINE.md](./QUALITY-INTELLIGENCE-ENGINE.md) |
| SoR rule    | **Never** authoritative business SoR; derived only                                                  |
| APIs        | `/api/v1/qep/qi/*`                                                                                  |
| Permissions | `qep.qi.read` · `qep.qi.admin`                                                                      |

### AI Services

| Field         | Definition                                                    |
| ------------- | ------------------------------------------------------------- |
| Purpose       | Orchestrate assistants, RAG, approvals                        |
| Ownership     | QepAiService — see [AI-ARCHITECTURE.md](./AI-ARCHITECTURE.md) |
| Relationships | All domains via services; Audit; Prompt registry              |
| APIs          | `/api/v1/qep/ai/*`                                            |
| Permissions   | `qep.ai.invoke` · `qep.ai.approve` · `qep.ai.admin`           |

### Notifications · Search · Documents · Administration · Security · Audit · Integrations

| Domain         | Ownership                                             | v1.1 posture                   |
| -------------- | ----------------------------------------------------- | ------------------------------ |
| Notifications  | Platform Notification Framework; QEP publishes events | Wire QEP events                |
| Search         | Platform Search; `search-qep` providers               | Expand entity coverage         |
| Documents      | DocumentService + optional links                      | Design; deep integrate 1.2     |
| Administration | QEP admin settings module                             | Minimal 1.1; full 1.2          |
| Security       | Platform authz + QEP permissions                      | Extend for new domains         |
| Audit          | Per-domain + unified explorer                         | Emit; unify 1.3                |
| Integrations   | Integration SDK adapters                              | Architecture in 111; build 170 |

---

## Cross-domain relationship map

```text
Requirement ──trace──► Specification ──member──► Suite
     │                      │                      │
     │                      └──────────► Plan ◄────┘
     │                                     │
     │                                     ▼
     │                                   Run ──► Execution ──► Evidence
     │                                     │          │
     └─────────────────────────────────────┴────► Defect
                                                    │
QualityIntelligence ◄── aggregates events/metrics ──┘
AI Assistants ──drafts──► (human approve) ──► Services
```
