# API — Source Change Coordination

Surface: `orchestration.sourceChange` (DI: `orchestration.source.change`).

| Operation                    | Purpose                       |
| ---------------------------- | ----------------------------- |
| Create Source Change Package | Normalized identities → SCP   |
| Read Source Change Package   | Fetch by id                   |
| Query Source Changes         | Change refs on a package      |
| Read Coordination History    | Audit trail                   |
| Read Source Identities       | Identities on a package       |
| Diagnostics                  | Counts, distributions, health |

No SCM execution endpoints.
