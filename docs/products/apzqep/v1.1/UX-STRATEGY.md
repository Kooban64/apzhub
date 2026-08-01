# UX Strategy — APZQEP v1.1

## Purpose

Make APZQEP the daily workspace for quality roles — consistent with Desktop Framework (005/016–019), Design System (006), and permission-driven shell — without one-off module UIs.

## Experience principles

1. **One QEP home** — role-aware landing, not seven disconnected apps
2. **Permission-driven** — Activity Bar / Sidebar / commands only show authorised surfaces
3. **Tokens only** — themes including dark mode via Presentation Engine
4. **Keyboard-first** — Command Palette + shortcuts for tester velocity
5. **Context over cards** — Context Panel for entity detail; avoid dashboard clutter
6. **Live enough** — SSE/WebSocket where platform already supports; no fake realtime
7. **Accessible** — WCAG AA target; axe in CI for new surfaces

## Dashboards (v1.1 scope)

| Dashboard     | Primary user | v1.1 content                                          |
| ------------- | ------------ | ----------------------------------------------------- |
| **Executive** | Leadership   | Deferred to 1.2 (summary tile on Home only)           |
| **QA**        | QA lead      | Plan progress, fail rate, open defects, LA risk flags |
| **Tester**    | Tester       | Assigned runs, blocked tests, evidence to attach      |
| **Developer** | Engineer     | Failed executions linked to commits/defects (MVP)     |
| **Project**   | PM/Lead      | Req coverage proxy, verification queue                |
| **Portfolio** | Portfolio    | Deferred 1.3+                                         |
| **Risk**      | Release/QA   | Open P0/P1 defects, evidence gaps, cert blockers      |
| **Analytics** | QI           | Deferred 1.2+                                         |

## Productivity

| Capability          | v1.1                                                    |
| ------------------- | ------------------------------------------------------- |
| Command Palette     | Register QEP create/search/navigate/AI-draft commands   |
| Keyboard shortcuts  | Run pass/fail, next test, attach evidence               |
| Modern navigation   | Dynamic module registration for new Runs/Suites/Defects |
| Context panels      | Entity side panel pattern shared across modules         |
| Notification Centre | Consume platform notifications for QEP events           |
| Personal workspace  | Saved views, pinned runs, recent entities               |
| Live updates        | Run progress + notification badges                      |
| Responsive UI       | Workbench breakpoints; no separate mobile app in 1.1    |
| Dark mode           | Theme token swap (existing)                             |
| Accessibility       | AA for new dashboards + Runs/Defects flows              |

## Information architecture (target)

```text
QEP Home
  ├── Requirements / Traceability / Verification (v1.0)
  ├── Specs / Plans (v1.0)
  ├── Suites / Runs / Executions (v1.1)
  ├── Defects (v1.1)
  ├── Evidence (v1.0 hardened)
  ├── Dashboards (role)
  ├── AI Workspace (assist)
  └── Search (unified)
```

## Non-goals

- Marketing landing redesign
- Replacing platform shell
- Card-heavy executive marketing widgets in first viewport
- Building a separate mobile client

## Success criteria

- New user reaches assigned run in ≤3 navigational steps
- Command Palette performs top 10 tester actions
- Dark mode + AA verified on new modules
- No module-local design systems
