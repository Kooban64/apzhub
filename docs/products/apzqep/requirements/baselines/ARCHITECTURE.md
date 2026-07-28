# Baseline Architecture

## Configuration-management principle

A `RequirementBaseline` is a configuration-management aggregate: a named,
numbered, tenant-scoped set of immutable requirement content-version references.
It fixes configuration items at the selected content version, rather than reading
the mutable current Requirement.

## Layers (Part 1 domain, extended in Parts 2–3)

Domain logic resides in `packages/qep-requirements/src/domain/baseline/`:

1. Value objects and immutable membership items define valid state.
2. Aggregate factory and pure transition/mutation functions protect invariants.
3. A repository interface defines the persistence boundary.
4. Event types/builders define asynchronous integration contracts, including
   `BaselineIntegrityVerified` (Part 3).
5. `requirement-baseline-integrity.ts` (Part 3) computes and re-verifies a
   deterministic SHA-256 fingerprint over canonical membership.

Part 2 added the application service (`requirement-baseline-application-service.ts`),
in-memory and PostgreSQL repository adapters, the platform-service/contracts
adapter, REST API routes, and permissions. Part 3 added integrity fingerprinting,
the `verifyBaselineIntegrity` command, `availableActions` on the DTO, and the
Workbench UI (list, create, detail, add-version, compare, requirement baseline
history panel).

## Future consumers

Verification, execution, evidence, certification, and reporting capabilities must
consume a locked baseline's pinned content versions and its integrity fingerprint.
They must not derive configuration from a mutable Requirement's latest state, and
must not treat an unverified baseline as trustworthy for release decisions.
