# APZOBSERVE-005 — Status and Severity Matrix

## Health / status (canonical)

| Value                        | Meaning                 | UI rule                                |
| ---------------------------- | ----------------------- | -------------------------------------- |
| unknown                      | Absent or unspecified   | Default for empty; never imply healthy |
| healthy / ready / alive      | Recorded positive state | Text + ● marker                        |
| degraded                     | Partial impairment      | Distinct from healthy                  |
| unhealthy / not_ready / dead | Negative recorded state | Distinct                               |
| maintenance                  | Maintenance context     | Distinct from healthy                  |

## Alert severity (canonical)

| Value    | Surfaces                     |
| -------- | ---------------------------- |
| info     | AlertDefinition / AlertState |
| warning  | AlertDefinition / AlertState |
| critical | AlertDefinition / AlertState |

## Surfaces certified

HealthCheck, ReadinessCheck, LivenessCheck, ServiceHealth, ServiceStatus, ComponentStatus, AlertDefinition, AlertState, HealthSummary, PlatformDiagnostic, Workbench StatusBadge.

## Rules

- Only domain vocabulary
- Missing → unknown
- Not colour-only (`aria-label` + text)
- UI does not invent competing taxonomies
