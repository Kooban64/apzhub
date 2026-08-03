# PLATFORM-DASHBOARD — APZQEP-164-000

| Field     | Value                                   |
| --------- | --------------------------------------- |
| Programme | APZQEP-164-000                          |
| Timestamp | 20260803T191002Z                        |
| Package   | `@apzhub/platform-dashboard` (intended) |

## Purpose

Reusable **dashboard framework** for APZHUB products. Provides composition, layout, widget host, saved views and configuration — not domain metrics and not quality business rules.

## Responsibilities

| In scope                         | Out of scope              |
| -------------------------------- | ------------------------- |
| Dashboard / page registry        | Quality scoring           |
| Widget host contract             | Recommendation generation |
| Layout grid / responsive regions | Evidence storage          |
| Saved views / pinned dashboards  | Connector calls           |
| Filter / time-range chrome       | Provider SDKs             |
| Dashboard metadata model         | Product-specific SoR      |

## Conceptual components

```text
Dashboard Registry
Widget Registry
Layout Engine
View Persistence Adapter (platform prefs / metadata store)
Filter Context Bus
Refresh Controller
Permission Gate
```

## Widget contract (architecture)

Every widget declares:

- `widgetId`, `version`, `title`
- required permissions
- data query descriptor (platform API path / projection id — never connector)
- refresh policy (manual / interval / event-driven)
- empty / loading / error states
- a11y label and keyboard map

Widgets **request data** through Platform Services; they never own mutation of quality facts except user actions that call authorised Platform Service operations (e.g. accept recommendation — already owned by QI).

## APZQEP consumption

APZQEP registers Quality Experience dashboards (Executive, QA, Release, …) as modules/views consuming this framework. Other APZHUB products may register their own dashboards without forking the framework.
