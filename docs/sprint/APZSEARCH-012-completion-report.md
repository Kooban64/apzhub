# APZHUB Programme — Milestone Completion Report

| Field              | Value                                                                                                           |
| ------------------ | --------------------------------------------------------------------------------------------------------------- |
| **Document ID**    | APZSEARCH-012-CR                                                                                                |
| **Milestone**      | APZSEARCH-012 — Documents Search Publication Adapter                                                            |
| **Programme**      | APZHUB Platform Search                                                                                          |
| **Status**         | **COMPLETE**                                                                                                    |
| **Classification** | Documents publication adapter (metadata-only; Search Platform frozen)                                           |
| **Date**           | 2026-07-15                                                                                                      |
| **Authority**      | Knowledge Foundation · owner-approved milestone                                                                 |
| **Predecessor**    | APZSEARCH-011 — Support Search Publication Adapter (Complete)                                                   |
| **Successor**      | **APZSEARCH-013 — APZ TCMS Search Publication Adapter** (**recommended; not started; requires owner approval**) |

---

## 1. Executive Summary

Delivered `@apzhub/search-documents` **0.1.0**, enabling the Document Platform to publish **metadata-only** canonical Search entities through `@apzhub/search-integration`.

No binary indexing, OCR, AI, Meilisearch, Search Platform, HTTP, Workbench, storage-provider, or Event Bus integration. Production factories require an explicit publication sink.

**Verdict:** COMPLETE.

---

## 2. Milestone scope delivered

| Item                                                 | Outcome      |
| ---------------------------------------------------- | ------------ |
| Package `@apzhub/search-documents`                   | **0.1.0**    |
| Publisher / mapper / validator / context / lifecycle | Done         |
| Diagnostics / metrics / logger / error translator    | Done         |
| Explicit lifecycle hooks                             | Done         |
| Safe-field allowlist + storage leakage rejection     | Done         |
| Audit `pnpm audit:search-documents`                  | **PASS** (0) |
| Docs + foundation stop points                        | Done         |

---

## 3. Package version

`@apzhub/search-documents` **0.1.0** (new). Unrelated packages unchanged except Document foundation harness pin (below).

---

## 4. Architecture

```text
Document contracts → DocumentsSearchPublisher → SearchIntegrationPublisher
  → (future) Search Platform → Meilisearch
```

See [Documents Search Publication Adapter](../architecture/APZHUB-Documents-Search-Publication-Adapter.md).

---

## 5. Supported entity types

`document` · `document_version` · `document_collection` · `document_folder` · `document_category` · `document_tag`

---

## 6. Canonical Document mapping

Maps `@apzhub/document-contracts` `Document` (and supporting models) → `SearchEntityDraft` with product **`documents`**. Storage refs, checksum hex, signatures, retention notes omitted. See [Mapping Guide](../guides/APZHUB-Documents-Search-Mapping-Guide.md).

---

## 7. Version-publication decision

**Primary Document + optional `document_version` entities.** Document carries current-version metadata; versions inherit security from parent Document; never storage keys or checksum hex. See [Versioning Guide](../guides/APZHUB-Documents-Search-Versioning-Guide.md).

---

## 8. Searchable metadata allowlist

`DOCUMENTS_SEARCH_SAFE_METADATA_KEYS` — allowlist-only. Reject storage/credential/URI patterns.

---

## 9. Classification mapping

Document codes → Search `public|internal|confidential|restricted` without downgrade; absent classification fail-closed. See [Security Guide](../guides/APZHUB-Documents-Search-Security-and-Classification-Guide.md).

---

## 10. Permission mapping

Context permissions + `${principalType}:${principalId}:${action}` tokens; status/classification visibility hints. No full ACL table dumps.

---

## 11. Tenant and organisation isolation

Trusted context tenant/org; entity tenant must match; cross-tenant reject. Tests cover mismatch failures.

---

## 12. Lifecycle mapping

draft → draft; active/restored → validated; archived/retained → archived; deleted/expired → removed (suggest). Removals only via framework `remove`.

---

## 13. Publication operations

publish · update · remove · validate · preview · diagnostics · lifecycle · statistics.

---

## 14. Lifecycle hooks

Explicit callable hooks only (create/metadata/classify/tag/folder/collection/version/archive/restore/delete/retention/report/relationship + taxonomy upsert/remove). Orchestration deferred.

---

## 15–20. Validation / preview / diagnostics / metrics / logging / errors

Fail-closed validation; redacted preview; safe diagnostics; in-process metrics; redacted logger; `SearchDomainError` translation. No provider details.

---

## 21. Relationship treatment

Not independent Search entities. `onDocumentRelationshipChanged` upserts the parent Document when supplied.

---

## 22. Generated-report references

Safe `generationId` / `reportType` / `generatedAt` / product on Document metadata. No Reporting package dependency.

---

## 23. Retention and legal-hold

`legalHold` + `retentionPolicyKey` only. Notes never published. No new retention policy logic.

---

## 24. Storage / platform boundaries

No document-persistence, document-storage, document-core, platform-services, Meilisearch, HTTP, Workbench imports (audit enforced).

---

## 25. Files created / modified

**Created:** `packages/search-documents/**`, audit script, architecture + guides + CR + coverage baseline.  
**Modified:** `tsconfig.base.json`, root `package.json`, foundation/README/CHANGELOG catalogues; `testing/document-foundation/apzdocs-003-foundation.test.ts` platform-services pin **0.16.0 → 0.18.0** (certified stack drift; same class as APZSEARCH-008 Search foundation pins).

---

## 26. Tests / Coverage / Gates

| Gate                                               | Result                                                                 |
| -------------------------------------------------- | ---------------------------------------------------------------------- |
| Unit tests                                         | **10 PASS**                                                            |
| Typecheck                                          | **PASS**                                                               |
| `pnpm audit:search-documents`                      | **PASS**                                                               |
| Coverage                                           | **97.03%** lines/statements · **100%** functions · **90.24%** branches |
| search-integration / projects / support regression | **PASS**                                                               |
| Document foundation (after pin fix)                | re-run PASS expected                                                   |

---

## 27. Backward compatibility

Frozen Search/Document products unchanged in behaviour. No HTTP/Workbench/adapter changes.

---

## 28. Known limitations / technical debt

- Platform Service call sites not wired to hooks.
- In-memory journal until Search Platform indexing bridge.
- Framework product contract still lists `document|folder|tag`; adapter expands types (compatible).
- Folder logical `path` included only when non-leaky; absolute storage-like paths rejected.

---

## 29. Recommendation

**APZSEARCH-013 — APZ TCMS Search Publication Adapter**

Do not implement without owner approval.

---

## 30. Stop condition

**APZSEARCH-012 is COMPLETE.** Stop before APZSEARCH-013.

---

## Document control

| Item        | Value                                            |
| ----------- | ------------------------------------------------ |
| Document ID | **APZSEARCH-012-CR**                             |
| Report      | `docs/sprint/APZSEARCH-012-completion-report.md` |
| Audit       | `pnpm audit:search-documents`                    |

**End of report.**
