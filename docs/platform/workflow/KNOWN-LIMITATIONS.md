# Workflow Platform — Known Limitations

> **Programme:** APZHUB-PLATFORM-WORKFLOW-001  
> **Classification:** DOCUMENTATION ONLY  
> **Date:** 2026-07-19

---

## Foundation programme limitations

| Limitation                       | Notes                                                        |
| -------------------------------- | ------------------------------------------------------------ |
| Documentation only               | No code / packages / tests from this programme               |
| Execute / schedule / HITL absent | Target capabilities; freeze forbids without Owner unlock     |
| Dual Workbench facets            | SoR vs Engine not yet unified commercial UX                  |
| n8n read-only                    | Reference Adapter **0.1.0** — not full execute certification |
| Multi-provider not shipped       | Temporal/Camunda/etc. roadmap only                           |
| Commercial SemVer absent         | APZ-WORKFLOW-001 planning only                               |

---

## Frozen wave limitations (retained)

From APZWORKFLOW-011 freeze:

- No execution, scheduling, workflow mutations, Event Bus wiring for runs, workers, designer, drag-and-drop, runtime credentials, or webhooks in certified engine wave
- Live adapter env-gated
- Architecture Frozen notices in force

---

## Honesty rule

Accepting this foundation **recognises** Workflow as a platform capability via ADR-0068/0069. It does **not** claim execute/schedule GA or lift the freeze. Do not treat Law/TCMS “workflow” artefacts as this platform.
