# APZ TCMS — Domain Model

**Product:** APZ TCMS  
**Milestone:** APZTCMS-001  
**Status:** Conceptual domain model — **no DDL**, no migrations, no code  
**Authority:** [Reference Architecture](./APZHUB-APZ-TCMS-Reference-Architecture.md) · [011](../011-data-architecture-system-of-record-principles.md) · [ADR-0059](../adr/ADR-0059-apz-tcms-native-product-architecture.md)

---

## Explicit exclusions (APZTCMS-001)

Conceptual entities and lifecycle states only. No SQL, Drizzle schemas, TypeScript types, or APIs. Schema design begins in **APZTCMS-002**.

---

## SoR rules

| Rule                           | Detail                                                                                    |
| ------------------------------ | ----------------------------------------------------------------------------------------- |
| Platform PostgreSQL            | System of Record for all TCMS domain metadata                                             |
| Object storage                 | Evidence / attachment blobs only                                                          |
| Projects / Support / Documents | External refs (platform global IDs) — never authoritative copies of foreign business data |
| Engine IDs                     | Adapter-internal; never exposed in UI                                                     |

Standard platform audit fields and global platform IDs apply (011).

---

## Entity catalogue

### Planning & risk

| Entity                          | Purpose                                              | Key relationships                                                    |
| ------------------------------- | ---------------------------------------------------- | -------------------------------------------------------------------- |
| **Requirement**                 | Traceability anchor for what must be verified        | Links to Feature/Epic/Story refs; covered by TestCases; informs Risk |
| **Feature / Epic / Story link** | Reference to Projects work items                     | Soft refs only (`projectRef` / global IDs) — not owned by TCMS       |
| **Risk**                        | Quality/product risk informing priority and coverage | May link Requirements and TestPlans                                  |

### Test structure

| Entity              | Purpose                                              | Key relationships                                              |
| ------------------- | ---------------------------------------------------- | -------------------------------------------------------------- |
| **TestPlan**        | Scoped verification intent for a release/milestone   | Contains Suites; linked to Requirements/Risks                  |
| **TestSuite**       | Reusable grouping of cases                           | Belongs to Plan(s); contains Cases; may define RegressionSuite |
| **TestCase**        | Atomic verification unit (manual and/or automatable) | Steps; links Requirements; appears in Suites                   |
| **TestStep**        | Ordered manual step with expected result             | Belongs to TestCase                                            |
| **RegressionSuite** | Designated suite set for regression campaigns        | Subset/role of Suites                                          |

### Execution & results

| Entity                 | Purpose                                            | Key relationships                                |
| ---------------------- | -------------------------------------------------- | ------------------------------------------------ |
| **ManualExecution**    | Human-driven execution session                     | Produces TestRun(s); captures actuals per step   |
| **AutomatedExecution** | Ingested or triggered automation session metadata  | Linked to adapter/source; produces TestRun(s)    |
| **TestRun**            | Single execution instance of a case or suite batch | Parent of TestResult(s); links Evidence          |
| **TestResult**         | Outcome for a case/step within a run               | Status: pass / fail / blocked / skipped / retest |

### Evidence & defects

| Entity         | Purpose                                                   | Key relationships                                |
| -------------- | --------------------------------------------------------- | ------------------------------------------------ |
| **Evidence**   | Structured proof artefact metadata                        | Refs blob storage; linked to Run/Result/Step     |
| **Attachment** | Generic file attachment metadata                          | May support cases, runs, certification, comments |
| **DefectLink** | Link from failure to Projects issue and/or Support ticket | Refs only                                        |

### Certification & governance

| Entity                  | Purpose                                        | Key relationships                           |
| ----------------------- | ---------------------------------------------- | ------------------------------------------- |
| **CertificationRecord** | Formal release/product certification instance  | Tracks CertificationState; gates; approvals |
| **CertificationState**  | Lifecycle state of certification               | See state machine below                     |
| **QualityGate**         | Rule set that must pass for a state transition | Evaluated against results/coverage          |
| **Approval**            | Human approval decision                        | Bound to CertificationRecord / gate         |
| **Signature / Witness** | Digital sign-off and optional witness          | Bound to Approval; audited                  |
| **AuditEvent**          | Immutable audit of TCMS-significant actions    | Append-only; correlation IDs                |

### Analytics & AI

| Entity                | Purpose                                                         | Key relationships                                     |
| --------------------- | --------------------------------------------------------------- | ----------------------------------------------------- |
| **CoverageMetric**    | Derived coverage measures (req, risk, suite, code-ref optional) | Computed; not SoR for business truth beyond snapshots |
| **DashboardSnapshot** | Point-in-time dashboard aggregate                               | Cached/derived                                        |
| **AISuggestion**      | Advisory AI output (**types only** in 001)                      | Linked to target entity; never authoritative          |

---

## Conceptual relationship diagram

```text
Requirement ──covers──► TestCase ◄──contains── TestSuite ◄──scopes── TestPlan
     │                      │                      │
     └── Risk               ├── TestStep           └── RegressionSuite
                            │
              ManualExecution / AutomatedExecution
                            │
                         TestRun ──► TestResult
                            │            │
                         Evidence    DefectLink ──► Projects / Support (refs)
                            │
                     Attachment (blobs in object storage)

CoverageMetric ◄── derived from ── Results + Requirements

CertificationRecord ──state──► CertificationState
        │
        ├── QualityGate (evaluations)
        ├── Approval ──► Signature / Witness
        └── AuditEvent
```

---

## Lifecycle states

### TestCase (conceptual)

| State      | Meaning                                  |
| ---------- | ---------------------------------------- |
| Draft      | Editable; not ready for formal execution |
| Ready      | Approved for use in plans/runs           |
| Deprecated | Retained for history; not newly assigned |
| Archived   | Soft-retired                             |

### TestRun

| State       | Meaning                         |
| ----------- | ------------------------------- |
| Planned     | Scheduled / assigned            |
| In Progress | Execution underway              |
| Completed   | All results recorded            |
| Aborted     | Stopped without full completion |

### TestResult status

| Status    | Meaning                              |
| --------- | ------------------------------------ |
| `pass`    | Expected met                         |
| `fail`    | Expected not met                     |
| `blocked` | Cannot proceed (env/data/dependency) |
| `skipped` | Intentionally not executed           |
| `retest`  | Requires re-execution after fix      |

### Manual execution (first-class)

| Aspect           | Model                                           |
| ---------------- | ----------------------------------------------- |
| Steps            | Ordered TestSteps with expected text            |
| Actual           | Captured per step during ManualExecution        |
| Evidence         | Screenshots, notes, attachments per step/run    |
| Outcome          | Aggregates to TestResult / TestRun              |
| Approvals        | Optional reviewer sign-off before plan closure  |
| Digital sign-off | Signature / Witness on approvals where required |

### CertificationState

| State                    | Meaning                             |
| ------------------------ | ----------------------------------- |
| **Development Ready**    | Dev verification baseline met       |
| **QA Ready**             | Ready for formal QA execution       |
| **Regression Ready**     | Regression suite criteria met       |
| **UAT Ready**            | Ready for user acceptance           |
| **Production Ready**     | Gates for production met            |
| **Certified**            | Formal certification completed      |
| **Failed Certification** | Gates/approvals failed              |
| **Conditional Approval** | Approved with documented conditions |

Transitions are enforced by **CertificationService** via QualityGates + Approvals — never by UI alone.

---

## AISuggestion (types only)

Conceptual suggestion kinds (no schema in 001):

| Type             | Purpose                                |
| ---------------- | -------------------------------------- |
| `case_draft`     | Proposed TestCase / steps              |
| `failure_triage` | Likely cause / flaky hint              |
| `coverage_gap`   | Uncovered requirement/risk             |
| `gate_insight`   | Explanation of gate failure (advisory) |

All require human acceptance before domain mutation.

---

## Multi-tenancy

All entities are tenant-scoped. Cross-tenant access prohibited. Restore of UI sessions re-validates permissions (018).

---

## Related

- [Reference Architecture](./APZHUB-APZ-TCMS-Reference-Architecture.md)
- [Module Catalogue](./APZHUB-APZ-TCMS-Module-Catalogue.md)
- [Backlog](../backlog/APZTCMS-Backlog.md)
