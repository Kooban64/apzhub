# ADR-0058: Integration SDK v1.0 Readiness & Documented Limitations

## Status

Accepted — OSS-100-10

## Context

OSS-100-01…09 delivered `@apzhub/integration-sdk` through **v0.9.0** (RC): auth, connection, health/diagnostics/lifecycle, errors/observability, AdapterBase, transport, mapping, events contracts, and harness/certification. Owner-approved **OSS-100-10** is **Integration SDK v1.0 Certification & Release Readiness** (not provisioning; provisioning remains deferred).

A formal certification gate is required before claiming production readiness or bumping to semver **1.0.0**. Known platform concerns (Event Bus, HTTP ingress, provisioning, durable stores, real Vault) remain intentionally out of the SDK.

## Decision

1. Technical certification outcome is **`PRODUCTION_READY_WITH_LIMITATIONS`**, mapping to exit criteria **PRODUCTION READY** with documented limitations.
2. Package version remains **`0.9.0`** until the owner explicitly accepts limitations, freezes the public API, and authorises a **1.0.0** bump — **do not auto-promote**.
3. Hard blockers for readiness: **none**.
4. Accepted limitations include: no Event Bus publish; no webhook HTTP ingress; no provisioning; no durable checkpoint/dedup/replay stores; `PlaceholderVaultSecretProvider` only; prefer subpath imports over the large root barrel.
5. If the owner rejects “PRODUCTION READY” wording without a 1.0 bump first, maturity labelling may remain **Release Candidate** until promotion — technical outcome still stands as `PRODUCTION_READY_WITH_LIMITATIONS`.
6. Provisioning stays deferred (e.g. OSS-100-11+); it is not required for this certification.

## Consequences

- Foundation and catalogues record OSS-100-10 complete and readiness with limitations.
- Consumers may treat the SDK as production-capable within documented limits without a 1.0 tag until owner promotion.
- Semver **1.0.0** remains an owner-governed API-stability commitment, not an automatic outcome of this ADR.

## Related

- [SDK-V1-CERTIFICATION.md](../../packages/integration-sdk/docs/SDK-V1-CERTIFICATION.md)
- [SDK-RELEASE-READINESS.md](../../packages/integration-sdk/docs/SDK-RELEASE-READINESS.md)
- [APZHUB-Integration-SDK-V1-Certification.md](../architecture/APZHUB-Integration-SDK-V1-Certification.md)
- [OSS-100-10 Completion Report](../sprint/OSS-100-10-completion-report.md)
- [ADR-0057](./ADR-0057-sdk-harness-vs-adapter-operations-certification.md)
