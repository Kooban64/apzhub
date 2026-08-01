# APZQEP-120-S04 — Engineering Notes

| Field      | Value                                           |
| ---------- | ----------------------------------------------- |
| Slice      | APZQEP-120-S04 Evidence Integrity Platform      |
| Process    | APZHUB-ENG-001 · ADR-0092 · ADR-0093 · ADR-0094 |
| Date       | 2026-08-01                                      |
| Depends on | S01 · S02 · S03 (certified)                     |

---

## Capability statement

S04 delivers **content integrity verification** and tamper detection.

It does **not** deliver digital signatures, legal non-repudiation, immutable storage, chain of custody, or cloud durability.

---

## Architecture

```text
Handler / Platform Service
  → Evidence Application Services
      → EvidenceIntegrityPlatformService   (S04 — integrity policy)
          → StoragePort / EvidenceStorageManager
              → Memory | Local providers
      → Domain establishIntegrity / verifyIntegrity / recordIntegrityContentMissing
          (pure state; no crypto)
```

Absolute rule: storage providers never own integrity policy.

## Modules

| Component                  | Path                                                                                                   |
| -------------------------- | ------------------------------------------------------------------------------------------------------ |
| Platform service           | `application/integrity/evidence-integrity-platform-service.ts`                                         |
| SHA-256 algorithm          | `application/integrity/algorithms/sha256-integrity-algorithm.ts`                                       |
| Algorithm registry         | `application/integrity/algorithms/registry.ts`                                                         |
| Stream digest              | `application/integrity/digest-from-storage.ts`                                                         |
| Domain establish / missing | `domain/evidence/evidence.ts`                                                                          |
| Factory wiring             | `create-application-services.ts` → `application.integrity`                                             |
| Platform API               | `qep-evidence-service-impl.ts` (`getIntegrityStatus`, `establishIntegrity`, `verifyIntegrityPlatform`) |

Domain `EvidenceIntegrityService` remains a pure compare helper (no I/O / no crypto).

## Status model

| Platform status     | Domain `verificationState` |
| ------------------- | -------------------------- |
| NOT_ESTABLISHED     | no integrity metadata      |
| ESTABLISHED         | `unverified`               |
| VERIFIED            | `verified`                 |
| MISMATCH            | `failed`                   |
| CONTENT_MISSING     | `content_missing`          |
| UNSUPPORTED / ERROR | operational                |

## Workflows

**Establish:** ACL → stream hash via StoragePort → persist integrity baseline → audit `evidence.integrity.established`. Idempotent if digest unchanged. Mismatch if content differs from existing baseline (no silent replace).

**Verify:** ACL → load baseline → stream hash → timing-safe compare → update verification metadata → audit verified/mismatch/content_missing.

**Capture:** server computes SHA-256; client hash must match; integrity established at capture.

## Permissions (reuse S01/S02)

| Operation          | Permission            |
| ------------------ | --------------------- |
| getIntegrityStatus | `qep.evidence.read`   |
| establishIntegrity | `qep.evidence.verify` |
| verifyIntegrity    | `qep.evidence.verify` |

Public status responses omit digests.

## Persistence

Integrity metadata remains on the Evidence aggregate (additive fields already present). No Local Provider sidecars. PG SoR remains a later slice.

## Events

Domain events: `evidence.integrity_established`, `evidence.integrity_verified`, `evidence.integrity_failed`, `evidence.integrity_content_missing`. Platform bus publish deferred (S07).

## API compatibility

v1.0 capture/verify remain. `providedActualHash` on verify is optional (server hashes when omitted). New platform methods are additive.

## Deferred

- PG metadata SoR
- Cloud providers (D-001)
- Digital signatures / PKI / TSA
- Retention / legal hold productisation
- Bulk integrity backfill workers
- Platform event bus publish
- TE EvidenceAccessPort wiring
