# Data and Migration Plan — APZQEP-120

**Rule:** Prefer additive migrations. No migration edits during this planning programme. Destructive changes require explicit Owner approval.

---

## S03 — Evidence metadata SoR

| Aspect         | Plan                                                                                                                                                                                        |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Current        | In-memory repository; no PG Evidence tables                                                                                                                                                 |
| Proposed       | Additive tables: evidence, evidence_version, evidence_link, evidence_access (if not derived), classification, retention flags, content_hash, storage_key, standard audit columns, tenant_id |
| Approach       | New numbered migration; RLS policies; repository adapter                                                                                                                                    |
| Backfill       | LA memory data **not** durable — document cold-start; no production memory backfill expected                                                                                                |
| Compatibility  | API IDs remain opaque strings; clients unaffected                                                                                                                                           |
| Rollback       | `DOWN` drops new objects only if empty/flag-guarded; prefer forward-fix                                                                                                                     |
| Tenant impact  | All rows tenant-scoped                                                                                                                                                                      |
| Validation     | Row counts; RLS negative tests                                                                                                                                                              |
| Risk           | Medium — cutover factory bug → empty reads; mitigate flag + dual-write optional                                                                                                             |
| Audit evidence | Migration checksum + integration logs                                                                                                                                                       |

## S04 — Blob storage

| Aspect    | Plan                                                                        |
| --------- | --------------------------------------------------------------------------- |
| Current   | No durable bytes                                                            |
| Proposed  | Objects keyed by tenant/evidence/version; metadata holds storage_key + hash |
| Migration | Config/infra not SQL; optional table for multipart upload state             |
| Backfill  | N/A for LA memory                                                           |
| Rollback  | Disable adapter; retain PG metadata                                         |
| Risk      | Orphan blobs — S10 reconciliation                                           |

## S05 — Hash columns

| Aspect        | Plan                                                               |
| ------------- | ------------------------------------------------------------------ |
| Current       | Client hash field may exist in domain                              |
| Proposed      | `content_hash` server-authoritative; algorithm column              |
| Migration     | Additive columns/defaults; recompute job for existing durable rows |
| Compatibility | If clients send hash, server validates or ignores per AC           |

## S06 — Audit / retention

| Aspect    | Plan                                                                                    |
| --------- | --------------------------------------------------------------------------------------- |
| Current   | Partial audit                                                                           |
| Proposed  | Durable audit rows (platform audit or evidence_audit); retention_until; legal_hold bool |
| Migration | Additive; **D-002** supplies default periods                                            |
| Rollback  | Stop writing new audit table; retain history                                            |

## S08–S09 — Outbox / DLQ

| Aspect        | Plan                                                          |
| ------------- | ------------------------------------------------------------- |
| Current       | TE outbox enqueue tables (0087/0088 era)                      |
| Proposed      | Additive DLQ/state columns or side table; lease owner columns |
| Compatibility | Existing enqueue rows drainable                               |
| Risk          | Double-process — lease + idempotency                          |

## S11–S12 — Search index

| Aspect   | Plan                                            |
| -------- | ----------------------------------------------- |
| Current  | Derived index for 5 types                       |
| Proposed | Additional entity docs in existing search store |
| SoR      | **Never** — rebuild from events/PG              |
| Reindex  | S12 job                                         |

## S13 — Notifications

| Aspect   | Plan                                                       |
| -------- | ---------------------------------------------------------- |
| Current  | Platform notification tables                               |
| Proposed | Mapping rows / templates refs only; no QEP duplicate store |

---

## Production risk summary

| Change           | Risk           | Mitigation                          |
| ---------------- | -------------- | ----------------------------------- |
| Memory→PG        | High if silent | Feature flag; cert before LA expand |
| Storage provider | High           | D-001; canary bucket                |
| Worker drain     | Medium         | Idempotency; shadow mode            |
| Search ACL       | High (leak)    | S12+S19 tests                       |

**No migrations are applied by APZQEP-120 planning.**
