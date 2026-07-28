# Migration Strategy (Architecture)

## Principles

Additive only · no destructive migrations · reversible cutover flags · reconcile in-flight memory state on deploy.

## Phases (for future ENG-001)

1. Ensure schema completeness (leases/provider_reference additive).
2. Implement Postgres repositories implementing existing contracts.
3. Dual-write optional brief period **or** flag cutover from memory→Postgres (prefer flag cutover with empty durable queue on first enable in environments that never wired 0065).
4. Enable workers claiming from Postgres.
5. Disable process-local Maps as SoR.
6. Rollback = disable worker durable claim flag; re-enable prior Phase A behaviour only if still available — document honesty if rollback loses post-cutover durable data.

## In-flight

Drain or fail-safe: on cutover, do not assume memory queue survives. Prefer enable durable path on idle/low queue or accept loss of ephemeral Phase A memory (document in ENG).

## No SQL in this programme.
