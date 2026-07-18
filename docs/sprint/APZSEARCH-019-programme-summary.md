# Search Publication Programme Summary

**Programme:** APZSEARCH-009 through APZSEARCH-019  
**Status:** **CLOSED** — **Architecture Frozen**  
**Classification:** PRODUCTION_READY_WITH_LIMITATIONS  
**Date:** 2026-07-18

---

## Objectives

Deliver a cross-product, metadata-only Search Publication ecosystem with durable orchestration, operational administration, and formal certification — without modifying the frozen Search Platform (001–008) and without Event Bus / AI / semantic search.

---

## Milestone outcomes

| Milestone | Objective                                         | Outcome                                                        |
| --------- | ------------------------------------------------- | -------------------------------------------------------------- |
| **009**   | Cross-Product Search Integration Framework        | `@apzhub/search-integration` (now **0.2.0**)                   |
| **010**   | Projects Publisher                                | `@apzhub/search-projects` **0.1.0**                            |
| **011**   | Support Publisher                                 | `@apzhub/search-support` **0.1.0**                             |
| **012**   | Documents Publisher                               | `@apzhub/search-documents` **0.1.0**                           |
| **013**   | Testing (TCMS) Publisher                          | `@apzhub/search-testing` **0.1.1**                             |
| **014**   | Reporting Publisher                               | `@apzhub/search-reporting` **0.1.0**                           |
| **015**   | Publication Certification                         | Ecosystem certified; **PRODUCTION_READY_WITH_LIMITATIONS**     |
| **016**   | Product Indexing Orchestration                    | `@apzhub/search-orchestrator` **0.1.0**; journal **0058/0059** |
| **017**   | Publication Operations & Administration           | `@apzhub/search-publication-admin` **0.1.0**; HTTP + Workbench |
| **018**   | Reliability Certification & Operational Readiness | `pnpm certify:search-publication`                              |
| **019**   | Wave Certification & Architecture Freeze          | Governance closeout; **Architecture Frozen**                   |

---

## Packages delivered

See [Reference Standard — Package catalogue](../architecture/APZHUB-Search-Publication-Reference-Standard.md).

---

## Architecture decisions

1. **Composition hooks** at composition root — avoid patching platform-services product services
2. **Durable journal first** — enqueue before async drain
3. **Framework-only sink** — orchestrator → `@apzhub/search-integration` only
4. **Package-owned ops permissions** — do not thaw frozen search-contracts
5. **Deny-by-default bootstrap** — `APZHUB_SEARCH_ORCHESTRATION_ENABLED`
6. **Search Platform freeze intact** — publication never modifies 001–008

---

## Lessons learned

- Certify publishers early (015) before orchestration (016) reduces rework
- Keeping admin permissions out of frozen contracts preserves platform freeze integrity
- In-memory admin overlays are acceptable for first ops slice if documented as limitations
- A single `certify:search-publication` command simplifies release evidence
- Wave freeze (019) should be docs-only — resist “one more feature” at closeout

---

## See also

- [Wave Closeout Report](./APZSEARCH-019-wave-closeout-report.md)
- [Architecture Freeze Notice](../architecture/APZHUB-Search-Publication-Architecture-Freeze-Notice.md)
