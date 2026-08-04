# Automation Coordination Package

Authoritative system of record for **what automation coordination the platform concluded was required**.

| Field                          | Description                                     |
| ------------------------------ | ----------------------------------------------- |
| Package ID                     | Stable identifier                               |
| Decision Package Reference     | Opaque QO-009 ref (never modified)              |
| Quality Flow Reference         | Opaque QO-004 ref                               |
| Required Automation Activities | Provider-neutral intents                        |
| Automation Priority            | low / normal / high / critical                  |
| Execution Constraints          | Hints only (parallelism, GO requirements, etc.) |
| Provider Eligibility           | Logical capability ids — not product names      |
| Coordination Status            | coordinated / not_required / deferred / …       |
| Audit History                  | Append-only                                     |

Packages are immutable. Supersession creates a new package (`supersedesPackageId`).

`execution: false` is explicit on every package.

## Future durable persistence

Process-local orchestration persistence (same as QO-001…QO-010). Durable coordination store deferred — not redesigned here.
