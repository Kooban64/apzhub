# APZ TCMS — Defect Model

**Milestone:** APZTCMS-008  
**Table:** `testing_defect_link`

---

## Principles

- APZ TCMS stores defect **intelligence** (refs + relationships)
- **No** external tracker synchronization (Jira, GitHub Issues, ADO, GitLab)
- Multiple provider kinds supported as metadata only

---

## Fields

| Field                              | Role                                                                                                             |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `internalRef` / `externalRef`      | Dual identity                                                                                                    |
| `providerKind`                     | `internal` \| `projects` \| `support` \| `external_generic`                                                      |
| `status`                           | open → in_progress → resolved → verified → closed (+ reopened/cancelled)                                         |
| `severity` / `priority`            | Impact ranking                                                                                                   |
| `ownerUserId`                      | Ownership                                                                                                        |
| `resolution` / `verificationState` | Closure workflow placeholders                                                                                    |
| Relationship id arrays             | requirements, plans, suites, cases, manual/automation executions, evidence, risks, release label, work item refs |

---

## Relationships

Bidirectional navigation via defect fields + optional `TraceabilityService` links. Link targets include requirements, stories/tasks, plans/suites/cases, executions, evidence, releases, risks.

---

## Permissions

`defects.view`, `defects.link`, `defects.update`, `defects.admin`
