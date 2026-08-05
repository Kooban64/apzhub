# Provider Contract — My Work Contributors

| Field     | Value                         |
| --------- | ----------------------------- |
| Programme | APZHUB-CAPABILITY-001-ENG-001 |
| Status    | **ACTIVE**                    |
| Timestamp | 20260805T103000Z              |

## Contract

Each provider:

1. Calls **only** its owning product Platform Service APIs
2. Returns zero or more **work card projections** (references)
3. Maps native status → shared lifecycle **projection** (non-authoritative)
4. Assigns `queueHints` for ENG-001 queues
5. On error: returns empty + error signal (composer continues)

## ENG-001 providers

| Provider               | Product      | Source APIs                                  |
| ---------------------- | ------------ | -------------------------------------------- |
| ProjectsTaskProvider   | APZ Projects | listProjects + listTasks(assignee=me) fan-in |
| SupportRequestProvider | APZ Support  | listSupportRequests(ownerId=me)              |
| TimeTimesheetProvider  | APZ Time     | listTimesheets (running / today heuristic)   |
| QepExecutionProvider   | APZQEP       | listAssigned + listReviewQueue executions    |
| WorkflowInboxProvider  | Workflow     | list inbox tasks / approvals                 |

## Retention

Product-local surfaces (e.g. `/workspace/projects/my-work`) **remain**. Portfolio My Work aggregates; it does not replace product ownership (G-UW-11).

## Deferred providers

Documents, Risk, Attention feed, Executive lenses — not in ENG-001.
