# Application Commands

`RequirementBaselineApplicationService` exposes `createBaseline`,
`updateDraftBaseline`, `addRequirementVersion`, `removeRequirementVersion`,
`lockBaseline`, `archiveBaseline`, and (Part 3) `verifyBaselineIntegrity`. Each
command asserts a required permission, loads and validates current state,
applies the corresponding pure domain function, persists via the repository
inside a transaction, appends an audit entry, and publishes a domain event. A
failing search/observation hook (`onBaselineUpserted`) never corrupts the
already-persisted baseline record. `lockBaseline` additionally loads every
member's content version, verifies its own snapshot integrity, builds canonical
membership integrity inputs, and rejects locking a baseline with zero members.
