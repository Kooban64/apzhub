# Domain Contracts

## Repository port

`RequirementBaselineRepository` declares draft creation, retrieval/listing, draft
membership append/removal, lock, and archive operations, plus (Part 3)
`recordIntegrityVerification`. In-memory (`infrastructure/in-memory/baseline-repository.ts`)
and PostgreSQL (`infrastructure/postgres/baseline-repository.ts`) adapters
implement the port; `lockBaseline` on both adapters accepts and persists the full
integrity metadata object (algorithm, schema version, fingerprint, verification
status, verified-at) and rejects locking an empty baseline.

## Event contracts

Types and pure builders exist for:

- `BaselineCreated`
- `BaselineItemAdded`
- `BaselineItemRemoved`
- `BaselineLocked`
- `BaselineArchived`
- `BaselineCompared`
- `BaselineIntegrityVerified` (Part 3)

The application service publishes these via `onDomainEvent` alongside an
append-only audit trail entry (`qep.requirement_baseline.*`); see
[AUDIT-AND-EVENTS.md](./AUDIT-AND-EVENTS.md).
