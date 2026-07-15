# APZHUB Programme — Milestone Completion Report

| Field | Value |
| --- | --- |
| **Document ID** | APZSEARCH-011-CR |
| **Milestone** | APZSEARCH-011 — Support Search Publication Adapter |
| **Programme** | APZHUB Platform Search |
| **Status** | **COMPLETE** |
| **Classification** | Support publication adapter (framework consumer; Search Platform frozen) |
| **Date** | 2026-07-14 |
| **Authority** | Knowledge Foundation · owner-approved milestone |
| **Predecessor** | APZSEARCH-010 — Projects Search Publication Adapter (Complete) |
| **Successor** | **APZSEARCH-012 — Documents Search Publication Adapter** (**recommended; not started; requires owner approval**) |

---

## 1. Executive Summary

Delivered `@apzhub/search-support` **0.1.0**, enabling Support to publish canonical searchable entities (Support Request, Article, Organisation, Group, User) into `@apzhub/search-integration`.

Preserved Support Request ≠ Project Task and Support Article ≠ Project Comment. No Zammad leakage. No Meilisearch / Search Platform / Framework / Projects adapter changes.

**Verdict:** COMPLETE.

---

## 2. Architecture

```text
Support Platform Services
  → SupportSearchPublisher / lifecycle hooks
  → SearchIntegrationPublisher
  → (future) Search Platform → Meilisearch
```

See [Support Search Publication Adapter Architecture](../architecture/APZHUB-Support-Search-Publication-Adapter-Architecture.md).

---

## 3. Canonical Mapping

Maps `SupportTicket` / `SupportArticle` / `SupportOrganization` / `SupportGroup` / `SupportUser` → `SearchEntityDraft` with product **`support`**. Article bodies become searchable excerpts. See [Mapping Guide](../guides/APZHUB-Support-Search-Mapping-Guide.md).

---

## 4. Publication Flow

validate · preview · publish · update · remove · lifecycle · diagnostics · statistics. Explicit hooks only — no listeners.

---

## 5. Validation

Canonical IDs, entity types, title, tenant, permissions, classification, mandatory metadata; Zammad / provider leakage rejected.

---

## 6. Diagnostics

Adapter version, entity-type counters, validation/publication failures, last operation, mapper notes — no provider diagnostics.

---

## 7. Security

Tenant isolation; Zammad IDs forbidden; `originMetadata` excluded; classification/permissions propagated.

---

## 8. Tests / Coverage / Quality Gates

| Gate | Result |
| ---- | ------ |
| Unit tests | **9 PASS** |
| Typecheck | **PASS** |
| `pnpm audit:search-support` | **PASS** (0 violations) |
| Coverage | **97.61%** lines/statements · **100%** functions · **94.55%** branches |

---

## 9. Technical Debt

- Platform Service call sites not yet wired to hooks.
- In-memory journal until Search Platform indexing bridge.
- Framework product contract still lists legacy `ticket|article|organization` strings; adapter uses `support_*` entity types (compatible; contracts may align later without behavioural change).

---

## 10. Recommendation

**APZSEARCH-012 — Documents Search Publication Adapter**

Do not implement without owner approval.

---

## 11. Stop condition

**APZSEARCH-011 is COMPLETE.** Stop before APZSEARCH-012.

---

## Document control

| Item | Value |
| --- | --- |
| Document ID | **APZSEARCH-011-CR** |
| Report | `docs/sprint/APZSEARCH-011-completion-report.md` |
| Audit | `pnpm audit:search-support` |

**End of report.**
