# APZHUB Programme — Milestone Completion Report

| Field              | Value                                                                                                            |
| ------------------ | ---------------------------------------------------------------------------------------------------------------- |
| **Document ID**    | APZSEARCH-013-CR                                                                                                 |
| **Milestone**      | APZSEARCH-013 — APZ TCMS Search Publication Adapter                                                              |
| **Programme**      | APZHUB Platform Search                                                                                           |
| **Status**         | **COMPLETE**                                                                                                     |
| **Classification** | TCMS publication adapter (metadata-only; Search Platform frozen)                                                 |
| **Date**           | 2026-07-15                                                                                                       |
| **Authority**      | Knowledge Foundation · owner-approved milestone                                                                  |
| **Predecessor**    | APZSEARCH-012 — Documents Search Publication Adapter (Complete)                                                  |
| **Successor**      | **APZSEARCH-014 — Reporting Search Publication Adapter** (**recommended; not started; requires owner approval**) |

---

## 1. Executive Summary

Delivered `@apzhub/search-testing` **0.1.1**, enabling APZ TCMS to publish **metadata-only** canonical Search entities through `@apzhub/search-integration` via **specialised domain publishers** coordinated by `TestingSearchPublisher`.

No Meilisearch, Search Platform, Integration SDK, Framework, HTTP, Workbench, OCR, AI, semantic/vector, Event Bus, workers, or polling. Production factories require an explicit publication sink.

**Verdict:** COMPLETE (architecture completion with specialised publishers).

---

## 2. Architecture

```text
APZ TCMS Platform Services
  → TestingSearchPublisher (orchestrator)
  → Specialised Domain Publishers (Manual / Automation / Certification / Release /
       Engineering Intelligence / Quality / Reporting Metadata / Pipeline)
  → Domain mappers → SearchEntityDraft
  → SearchIntegrationPublisher
  → (future) Search Platform → Provider Resolver → Meilisearch
```

See [Testing Search Publication Adapter](../architecture/APZHUB-Testing-Search-Publication-Adapter.md) and [Publisher Architecture](../architecture/APZHUB-Testing-Search-Publisher-Architecture.md).

---

## 3. Published entity types

**40** types across manual testing, automation, certification, release governance, engineering intelligence, **quality**, reporting metadata, and **pipeline** metadata (see architecture / mapping guide).

---

## 4. Mapping

Maps `@apzhub/testing-contracts` models → `SearchEntityDraft` with product **`testing`**. Domain mappers own mapping; facade composes for compatibility. Never evidence binaries, report bodies, storage refs, payload fingerprints, pipeline logs/artifacts, or CI secrets. See [Mapping Guide](../guides/APZHUB-Testing-Search-Mapping-Guide.md).

---

## 5. Validation

Fail-closed: tenant, classification, permissions, supported entity type, binary/report content absences, unsafe metadata allowlist scan.

---

## 6. Lifecycle

publish · update · remove · validate · preview · diagnostics · lifecycle · statistics. Explicit hooks only. Orchestrator routes to specialised publishers. See [Lifecycle Guide](../guides/APZHUB-Testing-Search-Publication-Lifecycle-Guide.md).

---

## 7. Security

Tenant/org isolation; never-downgrade classification; certification/release/evidence/pipeline visibility preserved via classification + permissions metadata. See [Security Guide](../guides/APZHUB-Testing-Search-Security-Guide.md).

---

## 8. Diagnostics

Publication counts, failures, validation failures, entity/lifecycle distribution, latency, adapter + framework versions. No provider diagnostics.

---

## 9. Tests / Coverage / Gates

| Gate                                                | Result                                                                 |
| --------------------------------------------------- | ---------------------------------------------------------------------- |
| Unit tests                                          | **16 PASS**                                                            |
| Typecheck                                           | **PASS**                                                               |
| Lint                                                | **PASS**                                                               |
| `pnpm audit:search-testing`                         | **PASS** (0)                                                           |
| Coverage                                            | **98.06%** lines/statements · **100%** functions · **80.97%** branches |
| search-integration / projects / support / documents | **untouched** (frozen)                                                 |

---

## 10. Quality Gates

typecheck · lint · tests · coverage · architecture / dependency / boundary audit — all **PASS**. No frozen-surface regressions.

---

## 11. Technical Debt

- Framework product contract still lists four Testing types; adapter expands catalogue (Documents pattern).
- Platform Service call sites not wired to hooks (orchestration deferred).
- In-memory journal until Search Platform indexing bridge.
- Domain mapper branch coverage varies; package branches **80.97%** overall.

---

## 12. Recommendation

**APZSEARCH-014 — Reporting Search Publication Adapter**

Do not implement without owner approval.

---

## 13. Stop condition

**APZSEARCH-013 is COMPLETE.** Stop before APZSEARCH-014.

---

## Document control

| Item        | Value                                            |
| ----------- | ------------------------------------------------ |
| Document ID | **APZSEARCH-013-CR**                             |
| Report      | `docs/sprint/APZSEARCH-013-completion-report.md` |
| Audit       | `pnpm audit:search-testing`                      |
| Package     | `@apzhub/search-testing` **0.1.1**               |

**End of report.**
