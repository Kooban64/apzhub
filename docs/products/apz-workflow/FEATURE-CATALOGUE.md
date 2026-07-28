# APZ Workflow — Feature Catalogue (Release 1.0)

> **Programme:** APZ-WORKFLOW-001  
> **Classification:** DOCUMENTATION ONLY  
> **Date:** 2026-07-19  
> **Authority:** [RELEASE-1.0-DEFINITION.md](./RELEASE-1.0-DEFINITION.md)

---

## Legend

| Tag   | Meaning                                                               |
| ----- | --------------------------------------------------------------------- |
| **F** | Foundation on disk (APZWORKFLOW frozen PRWL)                          |
| **P** | Planned for commercial Release 1.0 (not authorised by this programme) |
| **L** | Later than Release 1.0                                                |
| **X** | Explicitly excluded from Release 1.0                                  |

---

## Catalogue

| ID         | Feature                                                     | Tag                   | Notes                                                 |
| ---------- | ----------------------------------------------------------- | --------------------- | ----------------------------------------------------- |
| WF-CAT-01  | Workflow Catalogue (SoR)                                    | **F** / **P**         | Productise existing SoR catalogue                     |
| WF-CAT-02  | Workflow Templates                                          | **F** / **P**         | SoR templates                                         |
| WF-CAT-03  | Categories                                                  | **F**                 | Present                                               |
| WF-CAT-04  | Folders                                                     | **F**                 | Present                                               |
| WF-CAT-05  | Versions / publish / archive                                | **F**                 | SoR lifecycle                                         |
| WF-CAT-06  | Validation                                                  | **F**                 | SoR validation                                        |
| WF-ENG-01  | Engine discovery (workflows/templates)                      | **F**                 | Read-only n8n path                                    |
| WF-ENG-02  | Engine health / diagnostics / compatibility                 | **F**                 | Present                                               |
| WF-RUN-01  | Workflow Executions / Runs                                  | **P**                 | Requires ADR + Owner                                  |
| WF-RUN-02  | Execution History                                           | **P**                 |                                                       |
| WF-RUN-03  | Run Logs                                                    | **P**                 | Masked, permissioned                                  |
| WF-RUN-04  | Failures                                                    | **P**                 |                                                       |
| WF-RUN-05  | Retries                                                     | **P**                 | Idempotent policies                                   |
| WF-SCH-01  | Workflow Scheduling                                         | **P**                 |                                                       |
| WF-HUM-01  | Approvals                                                   | **P**                 |                                                       |
| WF-HUM-02  | Manual Tasks                                                | **P**                 |                                                       |
| WF-HUM-03  | Forms                                                       | **P**                 | Simple operator forms                                 |
| WF-CFG-01  | Variables                                                   | **P**                 |                                                       |
| WF-CFG-02  | Credentials (references)                                    | **P**                 | Never plain secrets                                   |
| WF-NTF-01  | Notifications (via Platform Notification Framework)         | **P**                 | Modules publish events only                           |
| WF-UX-01   | Unified commercial Workbench                                | **P**                 | Dual platform facets exist today                      |
| WF-NAV-01  | Activity Bar / Sidebar navigation                           | **F** / **P**         | Manifests exist; commercial product packaging pending |
| WF-IAM-01  | Permissions (`workflow.*`)                                  | **F** / **P**         | Extend for runs/approvals                             |
| WF-SRCH-01 | Search (titles/descriptions)                                | **P**                 | Search provider registration                          |
| WF-INT-01  | Projects integration                                        | **P**                 |                                                       |
| WF-INT-02  | Support integration                                         | **P**                 |                                                       |
| WF-INT-03  | Time integration                                            | **P**                 |                                                       |
| WF-INT-04  | Documents integration                                       | **P**                 |                                                       |
| WF-INT-05  | Analytics integration                                       | **P**                 |                                                       |
| WF-INT-06  | Identity integration                                        | **P**                 | Actor/context                                         |
| WF-INT-07  | Email / Calendar                                            | **P**                 | Via platform connectors/services                      |
| WF-PRV-01  | n8n primary provider                                        | **F**                 | CERTIFIED reference adapter **0.1.0**                 |
| WF-PRV-02  | Temporal / Camunda / Flowable / Logic Apps / Power Automate | **L** / **X** for 1.0 | Multi-provider after 1.0                              |
| WF-DES-01  | Visual drag-and-drop designer                               | **X** / **L**         | Not Release 1.0 primary UX                            |
| WF-AI-01   | AI workflow generation                                      | **X**                 | Not Release 1.0                                       |

---

## Release 1.0 feature cut line

Commercial **1.0.0** shall claim only features that are:

1. Implemented behind Platform Services + permissions, **and**
2. Covered by certification evidence, **and**
3. Documented in Known Limitations where residual.

Foundation-only packaging without execute/schedule may be an Owner-approved interim SemVer only via a separate release programme — this pack defines the **full commercial Release 1.0 intent**, not an interim packaging shortcut.
