# APZHUB Programme — Milestone Completion Report

| Field | Value |
| --- | --- |
| **Document ID** | APZSEARCH-014-CR |
| **Milestone** | APZSEARCH-014 — Reporting Search Publication Adapter |
| **Programme** | APZHUB Platform Search |
| **Status** | **COMPLETE** |
| **Classification** | Reporting publication adapter (metadata-only; Search Platform frozen) |
| **Date** | 2026-07-15 |
| **Authority** | Knowledge Foundation · owner-approved milestone |
| **Predecessor** | APZSEARCH-013 — APZ TCMS Search Publication Adapter (Complete) |
| **Successor** | **APZSEARCH-015 — Cross-Product Search Publication Certification & Production Readiness** (**recommended; not started; requires owner approval**) |

---

## 1. Executive Summary

Delivered `@apzhub/search-reporting` **0.1.0**, enabling the Reporting Platform to publish **metadata-only** canonical Search entities through `@apzhub/search-integration`.

No report rendering/generation/execution, workers, Event Bus, Meilisearch, Search Platform, HTTP, or Workbench changes. Production factories require an explicit publication sink.

**Verdict:** COMPLETE.

---

## 2. Milestone scope delivered

| Item | Outcome |
| ---- | ------- |
| Package `@apzhub/search-reporting` | **0.1.0** |
| Publisher / mapper / validator / context / lifecycle | Done |
| Diagnostics / metrics / logger / error translator | Done |
| Explicit lifecycle hooks | Done |
| Safe-field allowlist + content leakage rejection | Done |
| Audit `pnpm audit:search-reporting` | **PASS** (0) |
| Docs + foundation stop points | Done |

---

## 3. Package version

`@apzhub/search-reporting` **0.1.0** (new).

---

## 4. Architecture

```text
Reporting contracts → ReportingSearchPublisher → SearchIntegrationPublisher
  → (future) Search Platform → Meilisearch
```

See [Reporting Search Publication Adapter](../architecture/APZHUB-Reporting-Search-Publication-Adapter.md).

---

## 5. Supported entity types

`report_template` · `report_category` · `report_placeholder_catalogue` · `report_definition` · `report_type` · `report_profile` · `report_generation` · `report_generation_metadata` · `report_output_metadata` · `report_consumer` · `report_usage_summary`

Framework aliases: `template` / `report` / `dashboard` accepted by type guards.

---

## 6. Canonical Reporting mapping

Maps `@apzhub/reporting-contracts` `ReportTemplate` / `ReportGenerationMetadata` (+ thin local inputs) → `SearchEntityDraft` with product **`reporting`**. Rendered bodies, parametersJson values, checksum hex, section blueprints omitted. See [Mapping Guide](../guides/APZHUB-Reporting-Search-Mapping-Guide.md).

---

## 7. Generation / output publication decision

**Primary:** `report_generation_metadata`.  
**Alias:** `report_generation` (same model).  
**Companion:** `report_output_metadata` (format / size / checksumPresent only).

---

## 8. Searchable metadata allowlist

`REPORTING_SEARCH_SAFE_METADATA_KEYS` — allowlist-only. Reject content/credential/URI patterns.

---

## 9. Classification mapping

Context/extras → Search `public|internal|confidential|restricted` with fail-closed confidential default and **neverDowngrade**. See [Security Guide](../guides/APZHUB-Reporting-Search-Security-and-Classification-Guide.md).

---

## 10. Permission mapping

Context permissions required; copied onto drafts. No full ACL table dumps.

---

## 11. Tenant and organisation isolation

Trusted context tenant/org; entity tenant must match when present; cross-tenant reject.

---

## 12. Lifecycle mapping

preview/draft → draft; active/published/ready → validated; archived → archived; deleted/removed/expired → removed (suggest). Removals via framework `remove`.

---

## 13. Publication operations

publish · update · remove · validate · preview · diagnostics · lifecycle · statistics.

---

## 14. Lifecycle hooks

Explicit callable hooks only (template/category/definition/type/profile/generation/output/consumer/usage/placeholder). Orchestration deferred.

---

## 15–20. Validation / preview / diagnostics / metrics / logging / errors

Fail-closed validation; redacted preview; safe diagnostics; in-process metrics; redacted logger; `SearchDomainError` translation. No provider details.

---

## 21. reporting-core dependency

Declared dependency on `@apzhub/reporting-core` (version constant for diagnostics). No template binding, renderers, or output providers invoked.

---

## 22–24. Boundaries

No testing-*, search-testing, search-persistence, integration-meilisearch, platform-services, apps/web, Meilisearch, Event Bus, report rendering (audit enforced).

---

## 25. Files created / modified

**Created:** `packages/search-reporting/**`, audit script, architecture + guides + CR + coverage baseline.  
**Modified:** `tsconfig.base.json`, root `package.json`, foundation/README/CHANGELOG catalogues.

---

## 26. Tests / Coverage / Gates

| Gate | Result |
| ---- | ------ |
| Unit tests | **10 PASS** |
| Typecheck | **PASS** |
| Lint | **PASS** |
| `pnpm audit:search-reporting` | **PASS** |
| Coverage | **96.72%** lines/statements · **100%** functions · **82.74%** branches |
| search-integration / search-documents regression | **PASS** (see gates run) |

---

## 27. Backward compatibility

Frozen Search/Reporting products unchanged in behaviour. No HTTP/Workbench/adapter changes.

---

## 28. Known limitations / technical debt

- Platform Service call sites not wired to hooks.
- In-memory journal until Search Platform indexing bridge.
- Framework product contract still lists `report|template|dashboard`; adapter expands types (compatible, like Documents).
- No orchestration / workers / Event Bus.

---

## 29. Recommendation

**APZSEARCH-015 — Cross-Product Search Publication Certification & Production Readiness**

Certify the complete publication ecosystem (Projects · Support · Documents · APZ TCMS · Reporting): contract conformance, canonical entity consistency, tenant/org isolation, classification/permission preservation, architecture boundaries, frozen Search Platform integrity, cross-product discoverability. No new functionality.

Do not implement without owner approval.

---

## 30. Stop condition

**APZSEARCH-014 is COMPLETE.** Stop before APZSEARCH-015.

---

## Document control

| Item | Value |
| --- | --- |
| Document ID | **APZSEARCH-014-CR** |
| Report | `docs/sprint/APZSEARCH-014-completion-report.md` |
| Audit | `pnpm audit:search-reporting` |

**End of report.**
