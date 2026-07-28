# Repositories

| Port                     | Implementations      |
| ------------------------ | -------------------- |
| `VerificationRepository` | Postgres + in-memory |

## Capabilities

create · get by id · optimistic save · list (filtered/paginated) · exists · listHistory

Delete is intentionally absent.

Factories: `createQepVerificationPersistenceForProduction` / `ForTest` / `createQepVerificationPersistence`.

Mappers: `toStoredVerification`, `verificationMatchesListFilters` in `infrastructure/mappers/verification-mapper.ts`.

Contract tests: `infrastructure/in-memory/verification-repository.contract.test.ts`.
