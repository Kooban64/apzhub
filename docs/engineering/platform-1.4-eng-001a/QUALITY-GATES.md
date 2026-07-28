# Quality Gates — ENG-001B must satisfy

| Gate                                     | Requirement                                                   |
| ---------------------------------------- | ------------------------------------------------------------- |
| `pnpm build`                             | PASS                                                          |
| `pnpm typecheck`                         | PASS                                                          |
| `pnpm lint`                              | PASS                                                          |
| `pnpm format:check`                      | PASS                                                          |
| Unit tests                               | PASS                                                          |
| Integration (Postgres claim/concurrency) | PASS                                                          |
| OpenAPI validate (if API changed)        | PASS                                                          |
| Migration 0066 apply on clean+0065       | PASS                                                          |
| Restart recovery test                    | PASS                                                          |
| Duplicate/idempotency tests              | PASS                                                          |
| Tenant isolation admin tests             | PASS                                                          |
| Capacity evidence                        | Reference E02 / document limits; do not claim unbounded scale |
| Documentation                            | ENG-001B completion pack + runbooks                           |
| Architecture compliance                  | ADR-0073 Option A; no Email SoR/SMTP/WebSockets/SDK thaw      |

Failing any mandatory gate blocks Owner Engineering Acceptance.
