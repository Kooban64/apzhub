# Workspace Experience Model

## Principles

1. **Assembles experiences, never business logic.**
2. **References authoritative artefacts, never duplicates them.**
3. **Downstream of the platform** — never part of the decision pipeline.

## Separation

| Layer                 | Owner                         |
| --------------------- | ----------------------------- |
| Business state        | QO-001…QO-016 artefacts       |
| Workspace composition | QO-017 Workspace Experience   |
| Shell rendering       | Desktop Framework / future UI |

## Persistence

Uses existing orchestration in-memory persistence. Future durable workspace
persistence is deferred and must remain composition/reference-only.
