# Event Architecture — APZQEP-140-000

| Field     | Value                       |
| --------- | --------------------------- |
| Programme | APZQEP-140-000              |
| Status    | **COMPLETE** (architecture) |
| Timestamp | 20260802T163547Z            |

Defines major business events for Core QE. **No implementation.** Extends Evidence catalogue patterns (S07); new events register via `event.yaml` when engineered.

---

## Envelope & delivery (unchanged)

```text
Capability Service publishes
  → Platform Outbox (S08)
    → Processing Engine (S09)
      → Capability processors / QKI / Notifications
```

Past-tense names · correlation IDs · at-least-once · idempotent consumers.

---

## Major business events (catalogue sketch)

### Capability A — Suites

| Event ID              | Consumers                                      |
| --------------------- | ---------------------------------------------- |
| `qep.suite.created`   | QKI, Notify, Commands (cache invalidation N/A) |
| `qep.suite.updated`   | QKI                                            |
| `qep.suite.published` | QKI, Notify                                    |
| `qep.suite.archived`  | QKI, Notify                                    |
| `qep.library.updated` | QKI                                            |

### Capability B — Runs

| Event ID            | Consumers                                |
| ------------------- | ---------------------------------------- |
| `qep.run.created`   | QKI                                      |
| `qep.run.scheduled` | QKI, Notify                              |
| `qep.run.assigned`  | Notify, QKI                              |
| `qep.run.started`   | QKI, Notify                              |
| `qep.run.completed` | QKI, Notify, Coverage (E), Reporting (F) |
| `qep.run.cancelled` | QKI, Notify                              |

### Capability C — Execution

| Event ID                      | Consumers                                       |
| ----------------------------- | ----------------------------------------------- |
| `qep.execution.started`       | QKI, Notify                                     |
| `qep.execution.step_recorded` | QKI (optional throttle)                         |
| `qep.execution.completed`     | QKI, Notify, Defects hooks, Coverage, Reporting |
| `qep.execution.failed`        | QKI, Notify                                     |
| `qep.execution.aborted`       | QKI, Notify                                     |

Evidence events remain owned by Evidence domain (`qep.evidence.*`).

### Capability D — Defects

| Event ID                  | Consumers                 |
| ------------------------- | ------------------------- |
| `qep.defect.created`      | QKI, Notify, Traceability |
| `qep.defect.updated`      | QKI                       |
| `qep.defect.transitioned` | QKI, Notify               |
| `qep.defect.linked`       | QKI, Traceability         |
| `qep.finding.recorded`    | QKI, Reporting            |

### Capability E — Requirements & Traceability

| Event ID                                            | Consumers                       |
| --------------------------------------------------- | ------------------------------- |
| `qep.requirement.created` / `updated` / `baselined` | QKI                             |
| `qep.trace.linked` / `unlinked`                     | Coverage projection             |
| `qep.coverage.recomputed`                           | QKI, Reporting, Notify (policy) |

### Capability F — Reporting

| Event ID              | Consumers                |
| --------------------- | ------------------------ |
| `qep.report.exported` | Audit, Notify (optional) |

Reporting primarily **consumes**; it does not redefine domain facts.

---

## Consumer impact matrix

| Consumer             | Role                                                                        |
| -------------------- | --------------------------------------------------------------------------- |
| **QKI**              | Projection upsert/delete for search & command discovery                     |
| **Notifications**    | Subscription match → internal channel                                       |
| **Command Platform** | No direct event bus dependency; discovers via QKI; handlers invoke services |
| **Coverage (E)**     | Recompute on suite/run/execution/defect/requirement events                  |
| **Reporting (F)**    | Rollup projections / snapshots                                              |
| **Future AI**        | Read events or QKI; never bypass services for writes                        |
| **Future QI**        | Metric inputs from events + projections                                     |

---

## Ownership

| Event family                        | Publisher (sole)                         |
| ----------------------------------- | ---------------------------------------- |
| `qep.suite.*`                       | SuiteService                             |
| `qep.run.*`                         | RunService                               |
| `qep.execution.*`                   | ExecutionService                         |
| `qep.defect.*`                      | DefectService                            |
| `qep.requirement.*` / `qep.trace.*` | Requirement / Traceability services      |
| `qep.evidence.*`                    | Evidence Application Services (existing) |

Repositories and UI MUST NOT publish business events.
