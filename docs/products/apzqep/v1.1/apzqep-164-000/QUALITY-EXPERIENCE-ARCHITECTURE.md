# QUALITY-EXPERIENCE-ARCHITECTURE — APZQEP-164-000

| Field     | Value            |
| --------- | ---------------- |
| Programme | APZQEP-164-000   |
| Timestamp | 20260803T191002Z |

## Target architecture

```text
  ┌─────────────────────────────────────────────────────────────────┐
  │         Enterprise Dashboards & Experience Platform (APZQEP)    │
  │  Personas · Workspaces · Saved views · Release readiness UX     │
  └───────────────────────────────┬─────────────────────────────────┘
                                  │ consumes
          ┌───────────────────────┼───────────────────────┐
          ▼                       ▼                       ▼
  @apzhub/platform-dashboard   @apzhub/platform-visualization   @apzhub/ui
  (layouts, widgets, config)   (charts, timelines, viewers)   (design system)
                                  │
                                  │ reads via Platform Services / Gateway
                                  ▼
  Automation · SCM · Evidence · QI · Reporting · Notifications · Command · QKI
  Requirements · Execution · Defects
```

## Layer rules (mandatory)

1. **No business logic in the dashboard layer** — orchestration, scoring, recommendations, audit and permissions remain in Platform Services / prior wave platforms.
2. **No SoR duplication** — dashboards project derived views/caches; engines own facts.
3. **No provider branding leakage** — SCM/Automation/QI provider names only where permissioned ops surfaces require them.
4. **No redesign of Waves 1–3** — integrate via existing APIs, events and refs.
5. **Permission-driven UI** — Activity Bar, Sidebar, widgets and commands filtered by PermissionService (005/016/017).
6. **Explainability preserved** — QI recommendations always deep-link to explanation + evidence.
7. **Tokens only** — Design System (006/022/028); no hardcoded visual values in product modules.

## Experience domains (logical)

| Domain                 | Responsibility                                                      |
| ---------------------- | ------------------------------------------------------------------- |
| Dashboard Composition  | Assemble widgets into persona dashboards                            |
| Visualization          | Render metrics, timelines, heatmaps, viewers                        |
| Navigation / Workspace | Landing pages, pinned/saved views, deep links                       |
| Projection / Query     | Read-model queries against platform APIs                            |
| Preference Binding     | Layout prefs via Preference Service (023) — never grant permissions |

## Anti-patterns (forbidden)

- Putting recommendation generation in a widget
- Calling SCM/Automation connectors from UI
- Storing authoritative quality scores in dashboard config
- Building a chat/LLM assistant inside Wave 4
- Creating `@apzhub/platform-experience` as a catch-all package
