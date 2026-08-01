# UX Architecture — APZQEP v1.1

Extends [UX-STRATEGY.md](./UX-STRATEGY.md). Binding to Design System tokens, shell regions, WCAG AA.

---

## Personas

| Persona           | Goals                          | Primary surfaces                               |
| ----------------- | ------------------------------ | ---------------------------------------------- |
| Executive         | Confidence to release / invest | Home summary · Risk tiles · (Exec dash 1.2)    |
| Portfolio Manager | Cross-project quality          | Project dash · QI trends (depth 1.2+)          |
| QA Manager        | Plan quality & risk            | QA Dashboard · Release Readiness · Defects     |
| Test Lead         | Run progress & assignment      | Runs · Plans · Suites                          |
| Tester            | Execute efficiently            | Tester Dashboard · Run · Execution · Evidence  |
| Developer         | Fix failures fast              | Failed executions · Defects · links to commits |
| Product Owner     | Scope & acceptance             | Requirements · Verification · Readiness        |
| Business Analyst  | Spec quality                   | Requirements · Trace · AI analysis             |
| Auditor           | Prove control                  | Evidence · Audit trails · Read-only            |
| Administrator     | Configure safely               | Admin · Prompt library · permissions           |

---

## Dashboard architecture

| Dashboard | Widgets (v1.1)                                                  | Data source            |
| --------- | --------------------------------------------------------------- | ---------------------- |
| QA        | Open defects P0/P1, run pass rate, plan progress, evidence gaps | QI + domain queries    |
| Tester    | My assignments, blocked tests, pending evidence                 | Runs/Executions        |
| Developer | Failures linked to me/component                                 | Executions/Defects     |
| Project   | Coverage proxy, verification queue                              | QI + Verification      |
| Risk      | Blockers for release, LA flags                                  | Release Readiness + QI |
| Executive | Single summary strip on Home only                               | QI subset              |

No card spam in hero; one job per section.

---

## Workflows (canonical)

1. **Author** — Requirement → Spec → Suite membership
2. **Plan** — Plan from suite/specs → schedule Run
3. **Execute** — Run progress → Execution results → Evidence attach
4. **Triage** — Failure → Defect → link → notify
5. **Assure** — Readiness review → (optional) Certification path 1.2
6. **Assist** — AI draft → human edit/approve → service write

---

## Accessibility & responsive

| Concern    | Standard                                               |
| ---------- | ------------------------------------------------------ |
| WCAG       | AA for new surfaces; axe in CI                         |
| Keyboard   | Full run execution without mouse; documented shortcuts |
| Themes     | Light/dark via token themes                            |
| Responsive | Workbench breakpoints; no separate mobile app in 1.1   |
| Motion     | Subtle; respect reduced-motion                         |

---

## Productivity features

- Command Palette (Ctrl+Shift+P)
- Notification Centre (platform)
- Personal workspace: pinned runs, saved filters, recent entities
- Context Panel persistent on entity pages
- Bulk actions where server `availableActions` allow

---

## Component strategy

- Prefer `@apzhub/ui` + shared QEP patterns
- No module-local design systems
- Empty/loading/error states mandatory
- Permission-empty states distinct from true empty

---

## Mapping to programmes

| UX slice                      | Programme band           |
| ----------------------------- | ------------------------ |
| Shell nav for new modules     | 130 (+ 120 registration) |
| Dashboards / Home / Readiness | 140                      |
| AI Workspace UX               | 150                      |
| Admin UX                      | 180 / 1.2                |
