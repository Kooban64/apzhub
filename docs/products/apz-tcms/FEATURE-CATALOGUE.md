# APZ TCMS — Feature Catalogue (Release 1.0)

> **Programme:** APZ-TCMS-001  
> **Classification:** DOCUMENTATION ONLY  
> **Date:** 2026-07-19  
> **Authority:** [RELEASE-1.0-DEFINITION.md](./RELEASE-1.0-DEFINITION.md) · APZTCMS disk surfaces

---

## Legend

| Tag   | Meaning                                      |
| ----- | -------------------------------------------- |
| **F** | Foundation on disk (APZTCMS programmes)      |
| **P** | Planned for commercial Release 1.0 packaging |
| **L** | Later than Release 1.0                       |
| **X** | Explicitly excluded from Release 1.0         |

---

## Catalogue

| ID            | Feature                          | Tag                     | Notes                                                                             |
| ------------- | -------------------------------- | ----------------------- | --------------------------------------------------------------------------------- |
| TCMS-REQ-01   | Requirements                     | **F** / **P**           | Traceability                                                                      |
| TCMS-PLN-01   | Test Plans                       | **F** / **P**           |                                                                                   |
| TCMS-SUT-01   | Suites                           | **F** / **P**           |                                                                                   |
| TCMS-CSE-01   | Cases (manual first-class)       | **F** / **P**           |                                                                                   |
| TCMS-EXE-01   | Executions                       | **F** / **P**           | Manual + automated model                                                          |
| TCMS-EVD-01   | Evidence                         | **F** / **P**           | Metadata + storage refs                                                           |
| TCMS-DEF-01   | Defects                          | **F** / **P**           |                                                                                   |
| TCMS-COV-01   | Coverage                         | **F** / **P**           |                                                                                   |
| TCMS-QTY-01   | Quality gates                    | **F** / **P**           |                                                                                   |
| TCMS-CRT-01   | Certification states             | **F** / **P**           |                                                                                   |
| TCMS-APR-01   | Approvals / sign-off             | **F** / **P**           |                                                                                   |
| TCMS-REL-01   | Release readiness views          | **F** / **P**           |                                                                                   |
| TCMS-PIP-01   | Pipelines / CI metadata (GHA)    | **F** / **P**           | Read-only certified path                                                          |
| TCMS-EI-01    | Engineering Intelligence         | **F** / **P**           | APZTCMS-021/022                                                                   |
| TCMS-EXD-01   | Executive Dashboards             | **F** / **P**           | APZTCMS-023                                                                       |
| TCMS-RPT-01   | Reporting framework adjacency    | **F** / **P**           | APZTCMS-024 / Reporting                                                           |
| TCMS-SRCH-01  | Search publication               | **F** / **P**           | search-testing                                                                    |
| TCMS-IAM-01   | Permissions                      | **F** / **P**           | Server-authoritative                                                              |
| TCMS-UX-01    | Workbench Testing module         | **F** / **P**           |                                                                                   |
| TCMS-HTTP-01  | HTTP `/api/v1/testing/*`         | **F** / **P**           |                                                                                   |
| TCMS-PKG-01   | Commercial SemVer **1.0.0** pack | **P**                   | Absent today                                                                      |
| TCMS-INT-PRJ  | Projects integration             | **F** / **P** (limited) | Traceability adjacency                                                            |
| TCMS-INT-WF   | Workflow integration             | **L** / partial         | Not blocking packaging                                                            |
| TCMS-INT-AN   | Analytics integration            | **L** / partial         |                                                                                   |
| TCMS-INT-DOC  | Documents integration            | **L** / partial         | Evidence docs adjacency                                                           |
| TCMS-INT-NTF  | Notifications                    | **L** / partial         | Via Platform Notification Framework only                                          |
| TCMS-PRV-GHA  | GitHub Actions adapter           | **F**                   | Frozen reference                                                                  |
| TCMS-PRV-GL   | GitLab CI adapter                | **L**                   | R12-TCMS-01 — `@apzhub/integration-gitlab-ci` **0.1.0** metadata (APZHUB-1.2-007) |
| TCMS-PRV-KIWI | Kiwi TCMS adapter                | **X**                   | Superseded · absent                                                               |
| TCMS-AI-01    | AI Assist / auto-certify         | **X** / **L**           | Deferred; never auto-certify                                                      |

---

## Release 1.0 cut line

Commercial **1.0.0** shall claim only features that are implemented behind Platform Services + permissions, covered by certification evidence, and documented in Known Limitations where residual.
