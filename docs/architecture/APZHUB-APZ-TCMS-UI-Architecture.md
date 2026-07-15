# APZ TCMS — UI Architecture

**Product:** APZ TCMS  
**Module:** Testing (`testing`)  
**Milestone:** APZTCMS-010 (originally APZTCMS-001)  
**Status:** **Implemented in APZTCMS-010** — presentation-only workbench UI (typed client + mock transport; no HTTP/DB)  
**Authority:** [005](../005-desktop-environment-framework-shell-architecture.md) · [016](../016-desktop-shell-architecture-user-experience-framework.md) · [017](../017-navigation-framework-workspace-navigation-architecture.md) · [006](../006-design-system-ui-component-architecture.md) · [Module Catalogue](./APZHUB-APZ-TCMS-Module-Catalogue.md)

---

## APZTCMS-010 implementation

Core views delivered under `apps/web/components/testing/` with `apps/web/lib/testing` typed client. Module **enabled** (`services/testing/manifests/` — parent + 15 children). Shell wired via `workbench-page.tsx` → `TestingWorkspaceRouter`.

See [Testing Workbench Architecture](./APZHUB-APZ-TCMS-Testing-Workbench-Architecture.md) · [Navigation Guide](./APZHUB-APZ-TCMS-Testing-Navigation-Guide.md) · [View Catalogue](./APZHUB-APZ-TCMS-Testing-View-Catalogue.md) · [APZTCMS-010 Completion Report](../sprint/APZTCMS-010-completion-report.md).

### Remaining UI exclusions (010)

No HTTP APIs, no domain service wiring, no binary evidence upload, no reporting engine, no AI assist (deferred APZTCMS-011), no Command Palette full integration.

---

## Shell placement

| Region              | APZ TCMS behaviour                                              |
| ------------------- | --------------------------------------------------------------- |
| **Activity Bar**    | Icon/label **Testing** — visible only if permitted              |
| **Sidebar**         | Permission-filtered view list (below)                           |
| **Workspace**       | Active Testing view                                             |
| **Context Panel**   | Entity details, evidence preview, certification checklist       |
| **Header**          | Standard platform header (tenant, user, theme)                  |
| **Status Bar**      | Run/ingestion status snippets when permitted                    |
| **Command Palette** | Testing commands registered dynamically (019) — later milestone |

Fixed DEF regions only — no isolated page layouts outside the shell.

---

## Sidebar views

| View              | Purpose                                                      | Primary personas               |
| ----------------- | ------------------------------------------------------------ | ------------------------------ |
| **Dashboard**     | Aggregate readiness, failures, gate/certification summary    | Executive, QA Lead, PM         |
| **Requirements**  | Requirements, risks, Project refs                            | QA Lead, PM                    |
| **Plans**         | Test plans and scope                                         | QA Lead, PM                    |
| **Suites**        | Suites and regression suites                                 | QA Lead                        |
| **Cases**         | Cases and manual steps editor                                | QA Lead, Tester                |
| **Executions**    | Manual and automated execution sessions / runs               | Tester, Developer, QA Lead     |
| **Automation**    | Ingestion sources, automation runs, adapter health (summary) | Developer, Ops                 |
| **Evidence**      | Evidence browser and attachment access                       | Tester, Compliance             |
| **Defects**       | Defect links to Projects/Support                             | Developer, Support, QA Lead    |
| **Coverage**      | Coverage metrics vs requirements/risks                       | QA Lead, Executive             |
| **Certification** | Certification records, states, gates, approvals, signatures  | Compliance, Executive, QA Lead |
| **Reports**       | Exportable / printable quality and certification reports     | All (permissioned)             |
| **Admin**         | Module settings stubs, permission overview                   | Ops, Superadmin                |

Certification is a **view within Testing**, not a separate Activity Bar entry.

---

## Permission-driven navigation

```text
PermissionService (server)
        ↓
Filtered Activity Bar (Testing?)
        ↓
Filtered Sidebar views
        ↓
Filtered actions (execute, approve, certify, admin)
```

| Rule                 | Detail                               |
| -------------------- | ------------------------------------ |
| Server authoritative | UI hide ≠ security                   |
| Least privilege      | Default deny on certification mutate |
| Superadmin           | Distinct admin surfaces; audited     |
| No engine names      | Labels are APZHUB terminology only   |

---

## View interaction principles

| Principle               | Detail                                                       |
| ----------------------- | ------------------------------------------------------------ |
| Presentation only       | No business logic in views                                   |
| Tokens only             | Design system (006 / 028)                                    |
| Empty / loading / error | Shared patterns                                              |
| Manual execution UX     | Step list, expected/actual, evidence attach, result status   |
| Certification UX        | State timeline, gate checklist, approval + signature capture |
| Deep links              | Entity URLs permission-revalidated on open (017)             |

---

## Context panel (typical)

| When viewing  | Context panel may show                             |
| ------------- | -------------------------------------------------- |
| Case          | Linked requirements, last results, automation flag |
| Run           | Results summary, evidence, defect links            |
| Certification | Gate results, approvers, audit trail excerpt       |

---

## Design system alignment

- Shared `@apzhub` UI packages; Lucide icons only
- DataTable for case/run grids; dialogs for approvals
- No one-off TCMS visual language outside tokens
- WCAG AA target (015)

---

## Related

- [Testing Workbench Architecture](./APZHUB-APZ-TCMS-Testing-Workbench-Architecture.md)
- [Testing UX Guide](./APZHUB-APZ-TCMS-Testing-UX-Guide.md)
- [User Personas](../product/APZHUB-APZ-TCMS-User-Personas.md)
- [Module Catalogue](./APZHUB-APZ-TCMS-Module-Catalogue.md)
- [Reference Architecture](./APZHUB-APZ-TCMS-Reference-Architecture.md)
