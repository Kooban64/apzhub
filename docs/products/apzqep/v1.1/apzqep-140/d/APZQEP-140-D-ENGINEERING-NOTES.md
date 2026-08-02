# APZQEP-140-D Engineering Notes

- New package `@apzhub/qep-defects` `0.1.0` — does not reopen legacy TE defect links.
- Persistence: process-local **IN-MEMORY** (LIMITED_AVAILABILITY), consistent with Caps A–C.
- Cap C consumed via `ExecutionSessionPort` (read-only). Defect ops never call session mutate APIs.
- Evidence: ID references only; no duplicate storage.
- Platform: QKI defect projection, notification templates, command definitions registered via package exports; web runtime wires Cap C port.
- Out of scope (honoured): Requirements, Traceability, Reporting, AI/QI, external trackers.
