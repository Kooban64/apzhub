# Design Support — Prep Backlog

| Field       | Value                                                            |
| ----------- | ---------------------------------------------------------------- |
| Engineering | **NOT AUTHORISED** until Owner Auth for Prep Track               |
| Rule        | Only work guaranteed useful regardless of remaining Bible detail |

## Candidate prep items (await Auth)

| ID   | Item                                                                                                                | Why guaranteed                                               | Effort |
| ---- | ------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ | ------ |
| P-01 | Adopt `@apzhub/ui` DataTable / Dialog / Form patterns in Projects shell                                             | Design System already mandatory; every screen will need them | M      |
| P-02 | Projects Playwright fixture pack expansion (auth + project factory)                                                 | Any Release 3.0 UI needs stronger E2E harness                | S–M    |
| P-03 | Accessibility audit harness on existing Projects routes                                                             | WCAG AA is standing quality bar                              | S–M    |
| P-04 | Storybook coverage for shared components Projects will consume                                                      | Speeds Bible→build                                           | M      |
| P-05 | Notification Framework plumbing spike (subscribe to existing `events/projects` — no UX copy)                        | Events already defined; ch.09 will need delivery             | S      |
| P-06 | API client stubs generation from `ProjectService` / `TaskService` contracts for missing sprint/label/module methods | Contracts exist; Bible will use them                         | S–M    |

## Explicitly not prep

- Inventing board/Gantt UX before Screen Catalogue
- New business entities not in contracts or Bible
- AI anything

## Auth template (when Owner is ready)

```text
Prep Track: APZ-PROJECTS-RELEASE-3.0-PREP
Items: P-0x …
Engineering: AUTHORISED
Product features: FORBIDDEN
```
