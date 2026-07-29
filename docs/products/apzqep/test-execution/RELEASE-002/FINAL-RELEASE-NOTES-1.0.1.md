# Final Release Notes — Test Execution 1.0.1

## Summary

Production **security patch** for APZ QEP Test Execution. Promotes certified frozen candidate **1.0.1-rc.1** to **1.0.1**.

## Security

- **L-02 CLOSED** — EvidenceAccessPort default-allow removed; fail-closed enforcement verified (CERT-002).
- **RA-02 RETIRED**.
- Server-side evidence association always evaluates accessibility; unconfigured/indeterminate/error paths deny access.

## Availability

```text
LIMITED_AVAILABILITY_APPROVED
```

Security remediation has been completed and verified. Limited Availability remains in effect pending completion of operational browser readiness activities (authenticated Playwright journeys — L-OP-01).

**Unrestricted General Availability is not approved by this release.**

## Included vs 1.0.0

- L-02 remediation implementation
- Security and regression tests for evidence access
- Production bootstrap affirmative baseline evidence-access wiring
- Documentation / evidence for REM-001 → CERT-002 → FREEZE-002 → RELEASE-002

## Not included

- Unrestricted GA
- OpenAPI publication (L-01)
- Outbox dispatcher (L-03)
- Postgres integration test suite (L-04)
- Fine-grained Evidence Management ACL beyond baseline URI/actor policy

## Upgrade / rollback

- Upgrade from **1.0.0** → **1.0.1**: no DB migration.
- Rollback → **1.0.0** / tag `apzqep-test-execution-v1.0.0`.
