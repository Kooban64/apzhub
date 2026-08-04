# Event History

Append-only history records:

- Event ID
- Event Type / Version
- Timestamp
- Producer
- Correlation ID
- Causation ID
- Subject Reference
- Tenant / Project
- Sequence

History is immutable. Corrections are new events that supersede prior facts by correlation/causation, never by edit.
