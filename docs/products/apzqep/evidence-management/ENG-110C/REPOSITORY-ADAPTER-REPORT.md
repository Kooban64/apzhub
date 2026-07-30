# Repository Adapter Report — APZQEP-ENG-110C

| Field            | Value                                               |
| ---------------- | --------------------------------------------------- |
| Location         | `infrastructure/persistence/repository-adapters.ts` |
| Storage skeleton | `infrastructure/storage/storage-port-adapter.ts`    |

## Skeletons

All repository ports + `EvidenceUnitOfWork` + `StoragePort` have compile-time conforming skeletons.

Behaviour: each operation rejects with `PersistenceNotImplementedError` (Promise rejection).

## Explicitly absent

- Database clients
- SQL / NoSQL
- Object storage SDKs
- Hashing algorithms
- Transaction managers
- Event bus publication
