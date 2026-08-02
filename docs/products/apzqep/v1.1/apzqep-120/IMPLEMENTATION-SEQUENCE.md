# Implementation Sequence — APZQEP-120

## Ordered sequence (recommended)

| Seq | Slice     | Notes                                                       |
| --- | --------- | ----------------------------------------------------------- |
| 1   | S01       | ACL first — no Owner storage decision                       |
| 2   | S02       | Query Service & Permission Engine — **COMPLETE**            |
| 3   | S03       | Evidence Storage Platform + Local (ADR-0094) — **COMPLETE** |
| 4   | S04       | Evidence Integrity Platform — **COMPLETE**                  |
| 5   | S05       | Evidence Catalogue Platform (PG first durable adapter)      |
| —   | **D-001** | Cloud content backends later — not required for S03/S04     |
| 6   | S06       | Evidence Lifecycle & Governance Platform                    |
| 7   | S07       | Event catalogue/publish                                     |
| 8   | S08       | Outbox drain                                                |
| 9   | S09       | Retries/DLQ/fairness                                        |
| 10  | S10       | Failure evidence/reconcile                                  |
| 11  | S11       | Search providers                                            |
| 12  | S12       | Search ACL/reindex                                          |
| 13  | S13       | Notifications                                               |
| 14  | S14       | UCP registration                                            |
| 15  | S15       | TE OpenAPI _(may start after S02 in parallel track)_        |
| 16  | S16       | Live Playwright (flagged)                                   |
| 17  | S17       | Observability                                               |
| 18  | S18       | Perf baselines + QI skeleton                                |
| 19  | S19       | Security suite                                              |
| 20  | S20       | Programme certification                                     |

---

## Critical path

```text
S01 → S02 → S03 (Storage Platform) → S04 (Integrity) → S05 (PG metadata) → S06
                 → S07 → S08 → S09 → S10 → S11 → S12 → S13
                                              → S17 → S19 → S20
```

S16 joins after S08–S09 and S02.  
S15 parallel track from post-S02.  
S14 after S01 (+ preferably S11).  
S18 after meaningful worker/search load exists.

---

## Parallel workstreams

| Track               | Slices        | Owner coordination                                |
| ------------------- | ------------- | ------------------------------------------------- |
| Security/ACL        | S01→S02→…→S19 | Security Architect                                |
| Evidence durability | S03→S06       | S03 Local first (ADR-0094); D-001 for cloud later |
| Async platform      | S07→S10       | SRE + Platform                                    |
| Discovery/notify    | S11→S14       | After events                                      |
| TE contracts/runner | S15, S16      | TE lead                                           |
| Close               | S17→S20       | Programme lead                                    |

Unsafe overlap: concurrent writers to Evidence schema (S03/S04/S05/S06) — **serialise**.

---

## Blockers

| Blocker                        | Impact                                              |
| ------------------------------ | --------------------------------------------------- |
| D-001 unresolved               | Blocks cloud content providers only — not S03 Local |
| D-002 unresolved               | S06 uses hooks with TBD policy constants            |
| Missing infra credentials      | S04/S16 enablement                                  |
| Platform bus/outbox regression | S07–S09                                             |

---

## First recommended slice (historical)

**APZQEP-120-S01 — Evidence list/search ACL (L-EM-01)** — **COMPLETE** (with S02–S06).

Rationale at programme open: closed known security limitation; no storage decision; independently releasable; unblocked S02 and search ACL confidence.

---

## Current recommended next slice (after S01–S06)

**APZQEP-120-S07 — QEP domain event catalogue & publish**

Rationale: Evidence Platform complete; S07 is the critical-path unlock for async product capability (S08–S10 workers, then search/notify). Requires Owner slice instruction — see [PRODUCT-BOARD-RECOMMENDATION-NEXT-PROGRAMME.md](./PRODUCT-BOARD-RECOMMENDATION-NEXT-PROGRAMME.md).

**Implementation under that recommendation: NONE.**
