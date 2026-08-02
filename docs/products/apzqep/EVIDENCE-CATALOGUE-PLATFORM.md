# Evidence Catalogue Platform

| Field      | Value                                  |
| ---------- | -------------------------------------- |
| Product    | APZ QEP                                |
| Slice      | APZQEP-120-S05                         |
| Status     | **IMPLEMENTED** (LIMITED_AVAILABILITY) |
| Capability | Logical evidence catalogue             |

---

## Purpose

The Evidence Catalogue is the authoritative source of truth for **logical** evidence records: identity, ownership, metadata, relationships, lifecycle state, storage references, and integrity linkage.

PostgreSQL is the first durable persistence implementation for the Evidence Catalogue.

The Evidence Catalogue is **not** PostgreSQL. The correct relationship is:

```text
Evidence Catalogue
        ↓
Catalogue Repository Port (EvidenceRepository)
        ↓
PostgreSQL Catalogue Repository
```

## Source-of-truth boundaries

| Concern               | Authority                         |
| --------------------- | --------------------------------- |
| Logical evidence      | Evidence Catalogue                |
| Content bytes         | Storage Platform (S03)            |
| Content integrity     | Integrity Platform (S04)          |
| Visibility            | Permission Engine / ACL (S01–S02) |
| Permission-aware list | Query / Enumeration Service (S02) |

## Architecture

```text
Handler / Application Service
        ↓
EvidenceCatalogueService
        ↓
Permission Engine (reuse)
        ↓
Catalogue Repository Port (= EvidenceRepository)
        ↓
PostgreSQL Catalogue Repository | In-memory (tests / LA default)
```

Content operations remain:

```text
Evidence Catalogue Service
        ↓
Evidence Integrity Service
        ↓
Evidence Storage Manager
        ↓
Storage Provider
```

## Domain model

Catalogue records reuse the existing Evidence aggregate and `EvidenceRepository` port. No second catalogue repository was introduced.

Derived catalogue states (separate from storage state):

| Catalogue state   | Meaning                                            |
| ----------------- | -------------------------------------------------- |
| ACTIVE            | Normal logical record                              |
| UNAVAILABLE       | Content missing (`content_missing`)                |
| ARCHIVED          | Archived lifecycle                                 |
| RESTRICTED        | Quarantined                                        |
| LOGICALLY_DELETED | Logical deletion; catalogue/history retained (S06) |
| ARCHIVE_ELIGIBLE  | Logical archival readiness (S06)                   |
| DISPOSAL_ELIGIBLE | Disposal eligibility without purge (S06)           |
| SUPERSEDED        | Governed supersession (S06)                        |

## Relationships

Typed relationships via `EvidenceRelationshipRepository` (`targetCapability`, `targetId`, `relationType`). Validated domain identifiers; no free-text relationship types.

## Storage and integrity linkage

- Storage: opaque S03 locators (`evst://memory/…`, `evst://local/…`); no filesystem paths in public contracts.
- Integrity: status/fields on the aggregate; digests governed by S04 — catalogue does not recalculate policy.

## Query and ACL

List/search remain on the S02 path (`listEvidence` / `searchEvidence` → Permission Engine → Query Builder → Repository). Catalogue facade does not create a second listing path.

## Persistence modes

| Mode     | Env / factory                                                |
| -------- | ------------------------------------------------------------ |
| memory   | Default LA / tests (`APZQEP_EVIDENCE_CATALOGUE_MODE=memory`) |
| postgres | Requires `db`; no silent memory fallback                     |

Storage provider selection (`APZQEP_EVIDENCE_STORAGE_PROVIDER`) remains orthogonal.

## Migration

Additive SQL:

- `0089_apz_qep_evidence.sql` — tables/indexes
- `0090_apz_qep_evidence_rls.sql` — FORCE RLS + `app.tenant_id` policies

No evidence identifier rewrite, content rewrite, or integrity digest rewrite.

Existing in-memory evidence remains compatible. Durable catalogue starts empty for new PG installs; lazy enrichment of historical memory-only records is acceptable (no uncontrolled production backfill).

## Concurrency

Optimistic revision on `EvidenceRepository.save`. Stale updates raise concurrency conflict. Duplicate relationship unique constraints map to conflict errors.

## Residual consistency

Storage put and catalogue save are not a distributed transaction. Capture orchestration persists storage first then catalogue; failures surface as application errors. Reconciliation of orphaned blobs remains a later operational concern.

## Event readiness (S07)

Future bus contracts (not published in S05):

```text
qep.evidence.catalogue.created
qep.evidence.catalogue.updated
qep.evidence.catalogue.relationship.changed
```

Internal audit hooks continue via existing audit repositories.

## Limitations

- Not retention / legal-hold productisation (S06)
- Not cloud storage providers
- Not platform event-bus publication (S07)
- Not TE EvidenceAccessPort wiring
- Not package promotion or deployment
- Not unrestricted GA

## Related

- [EVIDENCE-INTEGRITY-PLATFORM.md](./EVIDENCE-INTEGRITY-PLATFORM.md)
- Storage Platform docs (S03)
- [v1.1/apzqep-120/S05-ENGINEERING-NOTES.md](./v1.1/apzqep-120/S05-ENGINEERING-NOTES.md)
