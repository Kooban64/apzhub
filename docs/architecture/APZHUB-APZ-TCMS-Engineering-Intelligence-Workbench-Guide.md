# APZHUB APZ TCMS — Engineering Intelligence Workbench Guide (APZTCMS-022)

## Route

`/workspace/testing/engineering-intelligence`

Sidebar: **Engineering Intelligence** (`engineering.view`).

## Panels (read-only)

| Panel | Content |
|---|---|
| Executive Overview | Quality score, health, risk, coverage/automation/certification cards |
| Quality Score | Component breakdown table |
| Engineering Health | Metric table + status badge |
| Trends | Search, kind filter, direction badges |
| Risk Overview | Factor table |
| Benchmarks | Benchmark + baseline tables; Compare Baselines |
| Historical Analysis | Immutable historical + engineering snapshots |

## Commands (read-only)

Refresh · Compare Baselines · Open Release · Open Certification · Open Coverage · Open Evidence · Open Pipeline · Export Summary

No mutation commands. Server remains authoritative for `analytics.*` / `engineering.*` / `benchmark.*` / `trend.*` / `quality.*`.

## UX states

Loading · empty · unauthorized/forbidden · provider errors · retry · responsive layout · keyboard tab panels · ARIA labels
