# Workflow Contracts — Compatibility Statement

> **Package:** `@apzhub/workflow-contracts` **0.4.0**  
> **Programme:** APZHUB-PLATFORM-WORKFLOW-003  
> **Date:** 2026-07-19

---

## Compatibility class

**ADDITIVE** relative to `@apzhub/workflow-contracts` **0.3.0**.

| Concern                                                                              | Status                          |
| ------------------------------------------------------------------------------------ | ------------------------------- |
| Existing SoR types (`Workflow`, `WorkflowVersion`, …)                                | Unchanged shapes                |
| `WorkflowPlatformGateway` / `WorkflowEngineGateway`                                  | Unchanged required facets       |
| New runtime models & service interfaces                                              | Additive exports                |
| Permission catalogue                                                                 | Additive keys only              |
| Consumers (`workflow-core`, `workflow-persistence`, `platform-services`, `apps/web`) | Compatible without code changes |

## Operation → permission mapping

| Named operation                         | Permission key                                           |
| --------------------------------------- | -------------------------------------------------------- |
| View workflow                           | `workflow.view`                                          |
| Create / update / delete workflow       | `workflow.create` / `update` / `delete`                  |
| Publish / archive / restore             | `workflow.publish` / `archive` / `restore`               |
| Validate                                | `workflow.validation`                                    |
| Audit                                   | `workflow.audit`                                         |
| Template CRUD                           | `workflow.template.*`                                    |
| Engine discovery                        | `workflow.engine.*`                                      |
| View / start / cancel runs              | `workflow.runs.view` / `start` / `cancel`                |
| View / manage schedules                 | `workflow.schedules.view` / `manage`                     |
| Task inbox / claim / complete / approve | `workflow.tasks.view` / `claim` / `complete` / `approve` |
| Credentials                             | `workflow.credentials.view` / `manage`                   |
| Administer                              | `workflow.admin`                                         |

Wildcards: `workflow.*` · `workflow.template.*` · `workflow.engine.*` · `workflow.runs.*` · `workflow.schedules.*` · `workflow.tasks.*` · `workflow.credentials.*`.

## Provider matrix (contracts layer)

| Provider                                  | Contract consumption                                   |
| ----------------------------------------- | ------------------------------------------------------ |
| n8n (`@apzhub/integration-n8n` **0.1.0**) | Maps to IM via adapter — **no** n8n types in contracts |
| Future providers                          | Must map to the same contract types                    |

## Known consumer baseline

| Package                        | Expected contracts version |
| ------------------------------ | -------------------------- |
| `@apzhub/workflow-core`        | workspace `*` → **0.4.0**  |
| `@apzhub/workflow-persistence` | workspace `*` → **0.4.0**  |
| `@apzhub/platform-services`    | workspace `*` → **0.4.0**  |
| `apps/web`                     | workspace `*` → **0.4.0**  |
