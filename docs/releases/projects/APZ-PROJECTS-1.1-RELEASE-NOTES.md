# APZ Projects 1.1.0 — Release Notes

> **Product version:** APZ Projects **1.1.0**  
> **Classification:** PRODUCT RELEASE  
> **Baseline:** APZHUB-PROJECTS-001 Phase 1 (Production)  
> **Date:** 2026-07-19  
> **Status:** **ACCEPTED / CLOSED** — current Production Release (Owner Acceptance 2026-07-19)  
> **Evidence archive:** [1.1.0/](./1.1.0/README.md)

---

## Summary

Workbench depth release on existing Wave 1 Platform HTTP. Users can transition task status, update priority, set/clear assignees, and edit/archive projects inside APZHUB. My Work defaults and honesty labels improve Production usability without platform redesign.

---

## Delivered (approved scope)

| ID         | Item                                                        |
| ---------- | ----------------------------------------------------------- |
| PRJ-1.1-01 | Task status transition + priority update UI                 |
| PRJ-1.1-02 | Task assignee set / clear UI                                |
| PRJ-1.1-03 | Project edit / archive UI                                   |
| PRJ-1.1-04 | My Work defaults (session user + last project)              |
| PRJ-1.1-05 | Roadmap & Sprint honesty labels                             |
| PRJ-1.1-06 | Search empty-state improvements                             |
| PRJ-1.1-07 | Typed client for existing task HTTP                         |
| PRJ-1.1-08 | Expanded Playwright certification (`apzhub-projects-1.1-*`) |

---

## Compatibility

| Component                                   | Version / state                      |
| ------------------------------------------- | ------------------------------------ |
| `@apzhub/integration-plane`                 | **0.6.0** — unchanged                |
| `@apzhub/integration-sdk`                   | **1.0.0** — frozen, unchanged        |
| Platform Services / project-service         | Consumed only — not redesigned       |
| Platform OpenAPI Wave 1 tasks/projects HTTP | Unchanged surface                    |
| Repository quality                          | QA-002 **PRODUCTION READY** retained |

See [APZ-PROJECTS-1.1-COMPATIBILITY.md](./APZ-PROJECTS-1.1-COMPATIBILITY.md).

---

## Residual limitations

Documented in [KNOWN-LIMITATIONS.md](../../products/projects/KNOWN-LIMITATIONS.md). Notably: no sprint list/CRUD HTTP; roadmap remains due-date ordering; My Work remains project-scoped; task status choices limited to workflow states already present on loaded project tasks (no status catalogue HTTP).

---

## Evidence

- [Completion Report](../../sprint/APZ-PROJECTS-1.1-completion-report.md)
- [Acceptance Report](../../foundation/completion-reports/APZ-PROJECTS-1.1-release-acceptance-report.md)
- [Quality Evidence](./APZ-PROJECTS-1.1-QUALITY-EVIDENCE.md)
