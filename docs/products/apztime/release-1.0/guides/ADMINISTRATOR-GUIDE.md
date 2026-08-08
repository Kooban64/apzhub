# APZ Time — Administrator Guide (v1.0)

## Permissions

| Permission    | Purpose                                 |
| ------------- | --------------------------------------- |
| `time.view`   | Browse timesheets and related records   |
| `time.manage` | Create/update/stop/archive              |
| `time.admin`  | Operator health/diagnostics + admin API |

Fine-grained `time.*` keys remain supported via wildcards.

## Operator surfaces

- **Health / Diagnostics** — admin-gated in the Workbench.
- **Settings** — personal prefs.

## Production

- Durable adapter required (`KIMAI_INTEGRATION_ENABLED`).
- Do **not** set `APZHUB_TIME_DOMAIN_MODE=in_memory` in production.
- Unavailable adapter fails closed (503).

## Out of scope toggles

Approvals, reporting UI, analytics, AI — not enabled in v1.0.
