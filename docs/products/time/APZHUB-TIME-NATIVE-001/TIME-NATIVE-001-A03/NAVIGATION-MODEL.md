# Navigation Model — TIME-NATIVE-001-A03

| Field     | Value            |
| --------- | ---------------- |
| Status    | **COMPLETE**     |
| Timestamp | 20260804T200500Z |

## Shell registration

Canonical source: `services/time/manifests/time/module.yaml`

| Surface       | Behaviour                                                                 |
| ------------- | ------------------------------------------------------------------------- |
| Activity Bar  | **Time** (short label), icon `clock`, `time.view`                         |
| Workbench     | View title **APZ Time**                                                   |
| Sidebar       | Overview, Timesheets, Activities, Customers, Tags, Search, Help           |
| Admin sidebar | Settings, Health, Platform readiness — gated by `time.admin`              |
| Breadcrumbs   | Every Time page via `PageShell` (`APZ Time / …`)                          |
| Cross-product | Standard shell Activity Bar peers (Projects, Support, …) — unchanged path |

## In-product navigation

- Sidebar is the primary navigation model (dashboard button-grid removed).
- Detail and create flows use Back / Cancel actions plus breadcrumbs.
- Context panel supplies selection-aware quick actions on Overview and timesheet detail.

## Routes added

| Route                         | Audience                                 |
| ----------------------------- | ---------------------------------------- |
| `/workspace/time/help`        | `time.view`                              |
| `/workspace/time/settings`    | `time.admin`                             |
| `/workspace/time/health`      | `time.admin`                             |
| `/workspace/time/diagnostics` | `time.admin` (label: Platform readiness) |
