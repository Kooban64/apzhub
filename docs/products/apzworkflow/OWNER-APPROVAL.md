# Owner Approval — APZ-WORKFLOW-000

| Field      | Value                      |
| ---------- | -------------------------- |
| Resolution | **OWNER-APZ-WORKFLOW-000** |
| Decision   | **APPROVED**               |
| Timestamp  | 20260805T163000Z           |

```text
Programme:
APZ-WORKFLOW-000

Decision:
OWNER APPROVED

Status:
CLOSED

Mission:
APPROVED

Business Outcomes:
APPROVED

Product Boundaries:
APPROVED

Enterprise Capability Alignment:
APPROVED

Recommendation:

Authorise APZ-WORKFLOW-NATIVE-001.

Proceed using the established Product Native Adoption Playbook without modification.

No architecture changes.
No methodology changes.
No Lane 1 platform work.
```

## Approval tests (satisfied)

1. **Business language (Workflow Test)** — workflows can be named without mentioning software (onboarding, complaint handling, project approval, procurement, leave, quality review, contract approval). Implementation verbs (webhook, automation, provider, API) fail the test.
2. **Product identity** — models, governs, and visualises business processes; not an automation engine, integration platform, event bus, rules engine, or scheduler.
3. **Intent vs execution** — Workflow asks “what should happen?”; automation asks “what runs?”; ownership of process definition stays with APZ Workflow.
4. **Backbone multiplier** — orchestrates how work moves across Projects, Support, Time, Documents (and quality) without owning their SoRs.
5. **Boundaries** — orchestration ≠ execution; engines remain invisible; no Lane 1 pull-forward.

## Standing distinction

> **Workflow = business intent.**  
> **Automation = execution.**

## Product Board principle (before Native Adoption)

Recorded under APZ-WORKFLOW-NATIVE-001 before N-01 starts:

> **A workflow describes what the business intends to happen. It does not prescribe how technology makes it happen.**

Programme APZ-WORKFLOW-000 is **CLOSED**. Mission pack remains authoritative for all future APZ Workflow decisions.
