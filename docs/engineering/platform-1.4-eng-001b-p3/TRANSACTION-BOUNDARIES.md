# Transaction Boundaries

| Boundary           | Scope                                               |
| ------------------ | --------------------------------------------------- |
| Claim              | Single TX SKIP LOCKED                               |
| Attempt start      | Short insertTry                                     |
| Channel I/O        | **Outside** DB TX                                   |
| Success completion | Fenced update + try finish + optional in-app insert |
| Retry              | Fenced update + try finish                          |
| Dead-letter        | Fenced update + try finish                          |
| Events             | After commit, fail-soft                             |

No row locks held across network/channel I/O.
