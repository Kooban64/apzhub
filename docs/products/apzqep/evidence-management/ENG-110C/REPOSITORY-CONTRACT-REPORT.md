# Repository Contract Report — APZQEP-ENG-110C

| Field    | Value                                                    |
| -------- | -------------------------------------------------------- |
| Location | `packages/qep-evidence/src/domain/ports/repositories.ts` |
| Layer    | Domain (interfaces only)                                 |

## Interfaces

| Port                             | Behaviours                                                    |
| -------------------------------- | ------------------------------------------------------------- |
| `EvidenceRepository`             | `save` (optimistic concurrency), `getById`, `list`            |
| `EvidenceCollectionRepository`   | `save`, `getById`, `list`                                     |
| `EvidenceSetRepository`          | `insert` (once), `getById`, `listByCollection`                |
| `EvidenceRelationshipRepository` | `save`, `getById`, `listByEvidence`, `listByTarget`, `delete` |
| `EvidenceVersionRepository`      | `listByEvidence`, `getVersion`                                |
| `EvidenceAccessGrantRepository`  | `save`, `revoke`, `findGrants`                                |
| `EvidenceAuditRepository`        | `append`, `listByEvidence`                                    |
| `EvidenceUnitOfWork`             | Coordinates the above; `execute` abstraction only             |

## Rules

- Behavioural contracts only — no SQL, ORM, or provider types.
- Stored aggregates clear `uncommittedEvents`.
- Concurrent stale `save` SHALL fail with conflict (adapter responsibility in a later wave).
- Dependency direction: Infrastructure → Domain.
