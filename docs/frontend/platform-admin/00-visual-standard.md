# Platform Admin — visual standard

| Field  | Value      |
| ------ | ---------- |
| Status | **LOCKED** |

> **PLATFORM ADMIN VISUAL STANDARD**
>
> Build Platform Admin as a professional enterprise operations console, visually related to the main APZ workbench but clearly identifiable as the platform control plane. Use a persistent compact left sidebar, restrained header, dense tables, compact status summaries, tabs, filters, contextual right-hand inspectors and clear operational states. Avoid oversized cards, excessive rounded containers, gradients, decorative graphics and consumer-SaaS dashboard styling.
>
> Use cards only for genuinely summarised information. Operational datasets belong in tables or structured lists.
>
> Never display simulated platform health, fake commercial values, fake provisioning success or placeholder operational metrics as though they are real. Use explicit loading, unavailable, not configured, degraded and error states.
>
> Provider implementation names such as Plane, Zammad, Kimai, Metabase, n8n and Paperless-ngx belong in the privileged Providers/Diagnostics surfaces. Normal operational screens use APZ capability names such as Projects, Support, Time, Analytics, Workflow and Documents.
>
> APZOR must appear and behave exactly like another tenant. Platform administrative authority exists above tenants and must never be inferred from APZOR employment or APZOR tenant membership.
>
> The UI should favour information density, fast scanning, keyboard operation, excellent tables and drawers, and minimal navigation interruption.

## Checklist for every screen

| Check         | Requirement                                                                                           |
| ------------- | ----------------------------------------------------------------------------------------------------- |
| Density       | Compact rows, tight status strips — not 12 giant colourful cards                                      |
| Cards         | Only for genuine summaries; datasets → tables / structured lists                                      |
| Honesty       | Real backend data **or** explicit `Loading` / `Unavailable` / `Not configured` / `Degraded` / `Error` |
| Naming        | Capability names on Ops; provider names only on Providers / Diagnostics                               |
| APZOR         | Ordinary tenant; no Internal / Owner / System Tenant badge unless real commercial metadata            |
| Inspectors    | Right-hand drawers for failures, audit events, row detail                                             |
| Design tokens | Follow Stream 5 / Design System — no hardcoded one-off palettes                                       |
| a11y          | WCAG AA target; operable tables and drawers                                                           |

## Tone

Platform control plane — operational, scannable, restrained. Related to the workbench shell, visually distinct as **platform** (header title `PLATFORM ADMIN`, denser chrome, status bar).
