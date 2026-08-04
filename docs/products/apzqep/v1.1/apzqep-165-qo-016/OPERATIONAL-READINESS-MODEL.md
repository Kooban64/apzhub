# Operational Readiness Model

## Principles

1. **Descriptive, never prescriptive.** Describes operational state; never changes it.
2. **Operational APIs expose the platform.** They never define the platform.
3. **References only.** Operational state is referenced, never duplicated as a competing SoR.

## Separation

| Concern            | Owner                                        |
| ------------------ | -------------------------------------------- |
| Platform state     | Business / orchestration slices (QO-001…015) |
| Operational view   | QO-016 Operational Readiness Package         |
| Platform operation | External (K8s, AWS, CI/CD, ops tooling)      |

## Persistence

Uses existing orchestration in-memory persistence. Future durable operational
persistence is deferred and must remain descriptive/reference-only.
