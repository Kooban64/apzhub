# Quality Intelligence Enrichment Package

Authoritative system of record for **enrichment only**.

| Field                              | Description                                |
| ---------------------------------- | ------------------------------------------ |
| Package ID                         | Stable identifier                          |
| Quality Flow / Decision / Impact   | Opaque upstream refs (never mutated)       |
| Automation / Source Change refs    | Optional opaque coordination refs          |
| Confidence Summary Reference       | Opaque ref                                 |
| Historical / Statistical / Signals | Opaque QI / trend refs                     |
| Advisory Insights                  | Additive insight records                   |
| Explainability                     | Why additive / non-authoritative statement |
| Audit History                      | Append-only                                |

Flags on every package: `advisory: true`, `authoritative: false`, `correctsUpstream: false`.

## Future durable persistence

Process-local orchestration persistence. Durable enrichment store deferred — not redesigned here.
