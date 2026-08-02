# User Experience Architecture — APZQEP-140-000

| Field     | Value                       |
| --------- | --------------------------- |
| Programme | APZQEP-140-000              |
| Status    | **COMPLETE** (architecture) |
| Timestamp | 20260802T163547Z            |

Aligns with APZHUB Desktop Framework (005/016/017) and v1.1 [INFORMATION-ARCHITECTURE.md](../../INFORMATION-ARCHITECTURE.md). **No UI implementation in this programme.**

---

## Primary navigation (Activity Bar → Sidebar)

```text
Activity Bar: QEP
  Sidebar (permission-filtered):
    Home
    Suites              ← Capability A
    Libraries           ← Capability A
    Runs                ← Capability B
    Executions          ← Capability C
    Defects             ← Capability D
    Requirements        ← Capability E
    Traceability        ← Capability E
    Evidence            ← existing platform
    Dashboards          ← Capability F
    Search
    Administration      ← admin only
```

Stub destinations remain **hidden** until their engineering programme delivers.

---

## Workspace model

| Workspace | Purpose                         | Default landing       |
| --------- | ------------------------------- | --------------------- |
| Home      | Recent, assigned, pinned        | Role home             |
| Authoring | Suites, Libraries, Requirements | Suite list            |
| Execution | Runs, Sessions, Executions      | My assignments        |
| Quality   | Defects, Evidence, Traceability | Open defects          |
| Insights  | Dashboards / Reporting          | Operational dashboard |
| Admin     | Capability config               | Settings              |

Shell regions unchanged: Header, Activity Bar, Sidebar, Workspace, Context Panel, Status Bar.

---

## Screen hierarchy (canonical)

```text
/workspace/qep
  /home
  /suites
  /suites/:suiteId
  /libraries
  /runs
  /runs/:runId
  /executions/:executionId
  /defects
  /defects/:defectId
  /requirements
  /traceability
  /evidence/:evidenceId
  /dashboards
  /dashboards/:dashboardId
```

Deep links stable; session restore re-validates permissions (018).

---

## Cross-capability navigation

| From      | To                              | Pattern                         |
| --------- | ------------------------------- | ------------------------------- |
| Suite     | Create Run                      | Command / primary action        |
| Run       | Start Execution                 | Command / primary action        |
| Execution | Attach Evidence / Create Defect | Context actions                 |
| Defect    | Linked Execution / Requirement  | Relationship chips              |
| Any list  | Entity                          | Row open → detail               |
| Anywhere  | Search hit                      | QKI → entity command            |
| Anywhere  | Command Palette                 | Ctrl+Shift+P → Command Platform |

---

## Shared components (Design System)

Reuse `/packages/ui` only: DataTable, filters, status badges, empty/loading/error, dialogs, forms. No one-off module chrome. Tokens only (006).

---

## Platform UX integrations

| Integration         | Behaviour                                                                  |
| ------------------- | -------------------------------------------------------------------------- |
| **Search**          | Unified search over QKI; results open via Command Platform entity commands |
| **Command Palette** | First client of `@apzhub/qep-command`; registers capability commands       |
| **Notifications**   | Internal channel inbox; preference-aware; deep link to entity              |
| **Evidence**        | Viewer/context panel; never raw engine UI                                  |

---

## Role-based experience

| Persona         | Emphasis                                      |
| --------------- | --------------------------------------------- |
| Tester          | Assignments, Executions, Evidence attach      |
| QA Lead         | Suites, Runs, Coverage, Defect triage         |
| Developer       | Defects linked to me, Evidence                |
| Project Manager | Runs progress, Defects, Dashboards            |
| Executive       | Capability F executive dashboards (read-only) |
| Admin           | Permissions, templates, notification policies |

Server-side PermissionService remains authoritative.

---

## Executive experience

- Read-only dashboards and portfolio views (Capability F)
- No write paths from executive surfaces
- Data from QKI / analytic projections only
- Mask backend branding always
