# Persistence Mapping Report — APZQEP-ENG-110C

| Field   | Value                                   |
| ------- | --------------------------------------- |
| Models  | `infrastructure/persistence/models.ts`  |
| Mappers | `infrastructure/persistence/mappers.ts` |

## Scope

Technology-neutral persistence records and pure mappers for:

- Evidence aggregate (+ versions, retention, legal hold, integrity metadata, history)
- EvidenceCollection
- EvidenceSet
- EvidenceRelationship
- EvidenceReference mapping (includes optional opaque `storageLocator` for infrastructure correlation)

## Rules

- Mappers perform translation only — no I/O.
- Domain aggregates remain authoritative; persistence records are representations.
- `uncommittedEvents` are never persisted (restored as empty).
- No schema / migration / SQL artefacts under this wave.
