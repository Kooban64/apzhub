# Release Notes — Evidence Management 1.0.0-rc.1

## Identity

| Field       | Value                                 |
| ----------- | ------------------------------------- |
| Product     | APZ QEP Evidence Management           |
| Package     | `@apzhub/qep-evidence` **1.0.0-rc.1** |
| Class       | **PRODUCTION_READY_WITH_LIMITATIONS** |
| Suitability | **LIMITED_AVAILABILITY**              |
| Programme   | APZQEP-FREEZE-003                     |

## What is included

- Domain Evidence aggregates, lifecycle, invariants
- Persistence contracts + StoragePort abstraction (ADR-0088 undecided)
- Application command/query orchestration
- L-02 fail-closed security & policy integration
- Versioned REST `/api/v1/qep/evidence`
- Workbench `/workspace/qep/evidence` (explorer / collections / capture)
- Platform service gateway wiring
- Operational readiness documentation (OPS-001)
- Independent certification (CERT-003)

## What is intentionally not included

- Durable storage technology / SQL / migrations (ADR-0088)
- Evidence-specific health/metrics/traces
- Platform event-bus publication
- Unrestricted GA / durable SoR posture
- Enumeration-level ACL filtering beyond ENG-110E design (L-EM-01 accepted)

## Compatibility

- Test Execution `@apzhub/qep-test-execution` **1.0.1** — regression verified
- Platform auth / permissions / gateway — inherited

## Upgrade / deploy notes

1. Persist RC tree to source control before deploy.
2. Expect **in-memory** Evidence persistence — data does not survive process restart.
3. Do not present this RC as unrestricted Evidence System of Record.
4. Promote to **1.0.0** only on Owner Freeze acceptance + subsequent Release programme.

## Known limitations

See CERT-003 accepted limitations (ADR-0088, observability, events, L-EM-01).
