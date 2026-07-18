# APZMETRICS-005 — Contract Traceability

**Date:** 2026-07-18

## Versions

| Package                       | Version |
| ----------------------------- | ------- |
| `@apzhub/metrics-contracts`   | 0.2.0   |
| `@apzhub/metrics-core`        | 0.2.0   |
| `@apzhub/metrics-persistence` | 0.1.0   |
| `@apzhub/platform-services`   | 0.25.0  |

## Flow

Contracts → Core validation/lifecycle → Platform Services DTOs → HTTP Zod schemas → Typed client types → Workbench rendering.

Identifiers, lifecycle statuses, pagination, and error categories remain consistent. Formula/KPI entities carry expression/target metadata only — no execution result fields on the governance path.
