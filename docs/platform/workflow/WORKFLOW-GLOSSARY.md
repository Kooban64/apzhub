# Workflow Platform — Glossary

> **Programme:** APZHUB-PLATFORM-WORKFLOW-002  
> **Classification:** DOCUMENTATION ONLY  
> **Authority:** [WORKFLOW-INFORMATION-MODEL.md](./WORKFLOW-INFORMATION-MODEL.md) · [ADR-0068](../../adr/ADR-0068-workflow-platform-first-class-capability.md)  
> **Date:** 2026-07-19  
> **Rule:** These definitions govern all future Workflow implementations. Conflicting UI copy must align.

---

## Canonical terms

| Term                        | Definition                                                                                 | SoR / owner                                                    | Must not confuse with                             |
| --------------------------- | ------------------------------------------------------------------------------------------ | -------------------------------------------------------------- | ------------------------------------------------- |
| **Workflow**                | Platform catalogue root representing an automation definition family under APZHUB branding | Workflow Platform                                              | n8n “workflow” UI object · Law/TCMS state machine |
| **WorkflowVersion**         | Immutable revision of a Workflow’s definition content and metadata                         | Workflow Platform                                              | Git commit · provider revision alone              |
| **WorkflowDefinition**      | Provider-neutral snapshot of steps/graph/config belonging to a WorkflowVersion             | Workflow Platform (content)                                    | Engine JSON export as user-facing model           |
| **WorkflowTemplate**        | Reusable blueprint used to create Workflows                                                | Workflow Platform                                              | Engine template gallery (masked)                  |
| **WorkflowParameter**       | Declared named input schema element for a definition/template                              | Workflow Platform                                              | Runtime WorkflowVariable value                    |
| **WorkflowVariable**        | Governed non-secret named value available to runs                                          | Workflow Platform                                              | Secret · Parameter declaration                    |
| **WorkflowRun**             | **Canonical** single execution attempt of a WorkflowVersion                                | Workflow Platform                                              | Provider execution id (opaque ref)                |
| **WorkflowExecution**       | Synonym of WorkflowRun — prefer Run in new APIs                                            | Workflow Platform                                              | —                                                 |
| **WorkflowInstance**        | Optional long-lived process handle when distinct from attempts; may own many Runs          | Workflow Platform                                              | Run                                               |
| **WorkflowExecutionStep**   | One node/step within a Run with status and timings                                         | Workflow Platform (+ provider detail)                          | ManualTask                                        |
| **WorkflowInput**           | Typed payload supplied when starting a Run                                                 | Value on Run                                                   | WorkflowParameter (schema)                        |
| **WorkflowOutput**          | Typed result payload of a completed Run                                                    | Value on Run                                                   | Artifact                                          |
| **WorkflowArtifact**        | Produced artefact (file/link/ref) from a Run or step                                       | Workflow Platform                                              | Secret                                            |
| **WorkflowSchedule**        | Time-based configuration that arms a Trigger                                               | Workflow Platform                                              | OS cron · provider schedule alone                 |
| **WorkflowTrigger**         | Rule describing when a Run may start (manual, event, API, schedule)                        | Workflow Platform                                              | Event Bus subscription alone                      |
| **WorkflowEvent**           | Platform-normalised event considered for trigger matching                                  | Platform Event envelope + Workflow normalisation               | Domain product event (source)                     |
| **WorkflowTask**            | Human work item attached to a waiting Run/step                                             | Workflow Platform                                              | Engine wait node (internal)                       |
| **HumanTask**               | Umbrella term for human-assigned WorkflowTask                                              | Workflow Platform                                              | Bot/system step                                   |
| **ManualTask**              | HumanTask requiring operator action/form completion                                        | Workflow Platform                                              | ApprovalTask                                      |
| **ApprovalTask**            | HumanTask requiring approve/reject (and optional comment)                                  | Workflow Platform                                              | ManualTask                                        |
| **WorkflowQueue**           | Logical queue for accepted/pending work                                                    | Workflow Platform                                              | Redis list implementation detail                  |
| **WorkflowCredential**      | Metadata describing a named credential binding usable by workflows                         | Workflow Platform                                              | Plain secret value                                |
| **WorkflowSecretReference** | Opaque pointer to a secret in an approved store — never the secret                         | Platform secret refs                                           | Credential password field in UI                   |
| **WorkflowNotification**    | Intent that a principal should be notified about a Workflow concern                        | Workflow Platform (intent) · Notification Framework (delivery) | SMTP send from module                             |
| **WorkflowError**           | Structured, user-safe failure description with category/code                               | Workflow Platform                                              | Raw provider stack trace                          |
| **WorkflowRetry**           | Policy or attempt record for re-executing a failed Run/step                                | Workflow Platform                                              | Manual re-run without policy                      |
| **WorkflowCompensation**    | Planned/compensating action(s) after failure                                               | Workflow Platform                                              | Undo in product UI                                |
| **WorkflowHealth**          | Health snapshot for Workflow Platform service / connector / engine                         | Workflow Platform                                              | Observability SoR telemetry ownership             |
| **WorkflowCapability**      | Named capability supported by platform or adapter (e.g. `runs.start`, `schedules`)         | Workflow Platform + adapter                                    | Product feature marketing flag                    |
| **Provider binding**        | Opaque mapping from platform entity to engine resource                                     | Connector-internal                                             | User-facing ID                                    |
| **Orchestration**           | Platform coordination of lifecycle, AuthZ, audit, and provider calls                       | Workflow Platform Services                                     | Product business rules                            |

---

## Related

- [WORKFLOW-INFORMATION-MODEL.md](./WORKFLOW-INFORMATION-MODEL.md)
- [WORKFLOW-DOMAIN-MODEL.md](./WORKFLOW-DOMAIN-MODEL.md)
