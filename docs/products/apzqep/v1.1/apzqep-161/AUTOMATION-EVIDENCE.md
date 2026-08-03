# Automation Evidence — APZQEP-161

## Rule

Automation execution **automatically** produces evidence artifacts and references. APZQEP does **not** create a parallel Evidence SoR.

## Produced artifacts (kinds)

Logs · Screenshots · Videos · Trace files · Console output · Network logs · Timing metrics · Execution metadata · Evidence references

## Integration

| System              | Wave 1 integration                                                     |
| ------------------- | ---------------------------------------------------------------------- |
| Evidence Platform   | Evidence refs on execution record + `onEvidencePublished` hook         |
| QKI                 | Same event/hook surface — consumers attach without duplication         |
| Notifications       | Lifecycle events via `onEvent` / future event bus                      |
| Reporting           | Execution summaries + timing available to reporting consumers          |
| Command Platform    | Workspace + API actions enqueue/run/cancel                             |
| Requirements / Plan | Correlation + target metadata (refs) — no duplicate planning subsystem |
| Defects             | Failed executions expose summary for later defect linkage waves        |

Wave 1 records refs and publishes events; deeper durable bus wiring remains available without engine redesign.
