# TRIGGER-CATALOGUE — APZQEP-165-000

| Field     | Value            |
| --------- | ---------------- |
| Programme | APZQEP-165-000   |
| Timestamp | 20260804T054651Z |

## Rule

Every trigger maps to zero or more Quality Flows via versioned **trigger bindings**. Unbound triggers are ignored (audited as `trigger.ignored`).

## Catalogue (V1.1 Wave 5 architecture)

| Trigger ID                   | Class            | In-scope V1.1   | Source capability / surface      | Typical flow intent                         |
| ---------------------------- | ---------------- | --------------- | -------------------------------- | ------------------------------------------- |
| `scm.push`                   | Repository       | YES             | SCM                              | Targeted / smoke quality flow               |
| `scm.pull_request.opened`    | Pull request     | YES             | SCM                              | PR quality flow                             |
| `scm.pull_request.updated`   | Pull request     | YES             | SCM                              | Re-run / incremental flow                   |
| `scm.pull_request.merged`    | Merge            | YES             | SCM                              | Post-merge regression / promotion candidate |
| `scm.tag.created`            | Release tag      | YES             | SCM                              | Release-candidate flow                      |
| `scm.release.published`      | Release          | YES             | SCM                              | Release verification flow                   |
| `scm.workflow_run.completed` | CI signal        | YES (correlate) | SCM / external CI                | Correlate external CI; optional follow-on   |
| `schedule.cron`              | Schedule         | YES             | Orchestration scheduling         | Compliance / full / soak                    |
| `manual.start`               | Manual           | YES             | Workspace / API                  | Operator-initiated flow                     |
| `api.flow.start`             | API              | YES             | Platform API Gateway             | Programmatic start                          |
| `command.flow.start`         | Command Platform | YES             | Command → Platform Service       | Palette-initiated start                     |
| `notification.action`        | Notification     | YES             | Notifications → Platform Service | Approve / retry / inspect actions           |
| `integration.external`       | External         | YES (generic)   | Registered integration events    | Partner/system triggers via contracts       |
| `provider.future.*`          | Future providers | ARCH ONLY       | Future registered capabilities   | Bind when capability registers              |

## SCM event mapping note

Provider-neutral trigger IDs above. GitHub (first SCM provider) maps webhook types → these IDs inside **SCM platform**, not orchestration. Orchestration consumes normalised SCM events.

## Out of scope as silent triggers

- Dashboard widget clicks that bypass Platform Services
- Hard-coded scripts outside registered trigger router
- Unauthenticated external webhooks (must enter via SCM/integration contracts + auth)

## Binding model

```text
TriggerBinding {
  triggerId
  filter (repo, branch, project, env, labels, …)
  flowId + flowVersion (or policy: latest-active)
  priority
  enabled
}
```

Filters are policy data — not UI hard-coding.
