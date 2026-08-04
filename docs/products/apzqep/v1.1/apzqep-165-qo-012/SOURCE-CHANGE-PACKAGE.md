# Source Change Package

Authoritative system of record for source change coordination.

| Field                               | Description                     |
| ----------------------------------- | ------------------------------- |
| Package ID                          | Stable identifier               |
| Quality Flow Reference              | Opaque QO-004 ref               |
| Decision Package Reference          | Optional opaque QO-009 ref      |
| Automation Coordination Package Ref | Optional opaque QO-011 ref      |
| Source Change References            | Opaque change refs              |
| Identities                          | Normalized source identities    |
| Repository / Branch / Commit refs   | Derived or explicit opaque refs |
| Pull/Merge Request / Tag/Release    | Derived or explicit opaque refs |
| Association                         | Association record              |
| Audit History                       | Append-only                     |

Packages are immutable. Supersession creates a new package.

`scmOperations: false` is explicit on every package.

## Future durable persistence

Process-local orchestration persistence (same as prior QO slices). Durable Source Change Package store deferred — not redesigned here.
