# Repository Management — APZQEP-162

## Capabilities

| Capability              | Supported                         |
| ----------------------- | --------------------------------- |
| Repository registration | Yes                               |
| Enable / disable        | Yes                               |
| Provider selection      | Yes (active providers only)       |
| Visibility              | Yes                               |
| Default branch          | Yes                               |
| Selected branches       | Yes (metadata)                    |
| Health status           | Yes                               |
| Connection validation   | Yes (`connect` / `health`)        |
| Synchronisation         | Yes (branches, commits, open PRs) |
| Audit via events        | Yes                               |

## Lifecycle

```text
connect(provider) → register(repository) → [enabled]
                         │
                         ├── sync → refresh metadata + refs
                         ├── disable / enable
                         └── traceability links (relationships only)
```

## Storage (Wave 2)

Process-local in-memory repository store (same pattern as Automation Wave 1). Durable persistence is a future enhancement — not Wave 2 scope.

## Neutrality

Repository records expose `providerId`, never GitHub REST entity shapes.
