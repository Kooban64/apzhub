# Decision Package

Authoritative system of record for the platform's conclusion.

| Field                         | Description                                   |
| ----------------------------- | --------------------------------------------- |
| Decision Package ID           | Stable identifier                             |
| Quality Flow Reference        | Opaque QO-004 ref                             |
| Decision Profile              | Profile id + version                          |
| Impact Summary                | Snapshot from QO-005 (not re-correlated)      |
| Confidence Summary            | Composed from prior sources                   |
| Risk Summary                  | Impact risk snapshot                          |
| Policy Selection Reference    | Opaque QO-006 ref                             |
| Governance Decision Reference | Opaque QO-007 ref                             |
| Approval Bundle Reference     | Opaque QO-008 ref                             |
| Platform Conclusion           | Advisory outcome                              |
| Residual Risk                 | Composed residual risk                        |
| Outstanding Items             | Governance / approval / activity / conditions |
| Explainability                | Mandatory rationale                           |
| Audit History                 | Append-only                                   |
| Metadata                      | Free-form                                     |

Packages are immutable after creation.

## Future durable persistence

Current slice uses process-local orchestration persistence (same pattern as QO-004…QO-008). Durable Decision Package storage is deferred to a later hardening/persistence certification — not redesigned here.
