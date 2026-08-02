# Product Board Recommendation — Next APZQEP Engineering Programme

| Field               | Value                                       |
| ------------------- | ------------------------------------------- |
| Document            | PRODUCT-BOARD-RECOMMENDATION-NEXT-PROGRAMME |
| Programme context   | APZQEP-120 (after S01–S06)                  |
| Prepared (UTC)      | 20260802T123027Z                            |
| Engineering         | **NONE** (recommendation only)              |
| Governance          | **UNCHANGED**                               |
| Enterprise Baseline | **UNCHANGED**                               |
| Implementation      | **NOT STARTED**                             |

---

## Final report

```text
Governance:
UNCHANGED

Enterprise Baseline:
UNCHANGED

Engineering:
NONE

Recommendation:
Next APZQEP engineering programme = APZQEP-120-S07

No Enterprise Governance work recommended.
```

---

## 1. Product Board recommendation

**Recommend authorising:**

```text
Programme: APZQEP-120
Standard / Slice: APZQEP-120-S07
Title: QEP domain event catalogue & publish
Priority: P0
Classification: Product capability engineering
Mandatory inputs (consume, do not redesign):
  - Governance 1.0 STABLE
  - Enterprise Engineering Baseline 1.2
  - APZQEP Engineering Framework v1.0
  - Testing Standard (ES-001 / APZQEP specialisation)
  - Certification Standard (ES-002 / APZQEP specialisation)
  - Engineering Specification Template (ES-003)
```

**Do not authorise at this time:** ES-004+, further APZHUB-ENG-002 standard promotions, governance redesign, TE EvidenceAccessPort pull-forward, APZQEP-130+.

**Rationale:** Evidence Platform (S01–S06) is complete. The largest remaining gap is product capability on the async / integration path. S07 is the approved critical-path next slice: it establishes domain events on the existing platform bus and unblocks S08–S10 (workers), then S11+ (search/notify).

---

## 2. Dependency analysis

### Completed prerequisites

| Slice | Outcome                                          |
| ----- | ------------------------------------------------ |
| S01   | Evidence list/search ACL — COMPLETE              |
| S02   | Query / Permission Engine — COMPLETE · CERTIFIED |
| S03   | Evidence Storage Platform — COMPLETE             |
| S04   | Evidence Integrity Platform — COMPLETE           |
| S05   | Evidence Catalogue Platform — COMPLETE           |
| S06   | Evidence Lifecycle & Governance — COMPLETE       |

### S07 technical dependencies

| Dependency                     | Status         | Note                               |
| ------------------------------ | -------------- | ---------------------------------- |
| `platform-event-bus`           | Exists (reuse) | Do **not** build a new bus         |
| Platform Services publish path | Available      | Publish from services, not modules |
| Stub `events/qep/*.yaml`       | Present        | Promote to validated manifests     |
| S01 ACL confidence             | COMPLETE       | Optional soft dep                  |
| Owner slice instruction        | **Required**   | Implementation not yet authorised  |

### What S07 unblocks

```text
S07 → S08 (outbox drain) → S09 (retries/DLQ) → S10 (failure evidence)
S07 → S11 (search indexing from events) → S12 → S13 → …
```

### Explicit exclusions (remain out of S07)

- New event bus
- Webhook product
- Suites events (APZQEP-130)
- TE EvidenceAccessPort wiring (deferred)
- Search UI, notifications product, UCP UX, AI, dashboards

### Blocker watch

| Risk                           | Impact                           |
| ------------------------------ | -------------------------------- |
| Platform bus/outbox regression | Blocks S07–S09                   |
| Starting S08 before S07        | Breaks event contract foundation |

---

## 3. Updated roadmap (APZQEP-120 focus)

### Phase status

| Band                  | Slices  | Status                                   |
| --------------------- | ------- | ---------------------------------------- |
| Evidence Platform     | S01–S06 | **COMPLETE**                             |
| Async / events        | S07–S10 | **NEXT** (S07 first)                     |
| Discovery / notify    | S11–S14 | Planned after events                     |
| TE contracts / runner | S15–S16 | Parallel track (post-S02 / post-workers) |
| Close-out             | S17–S20 | Programme certification path             |

### Recommended near-term sequence (capability maximising)

| Order | ID      | Title                                   | Why now                                          |
| ----- | ------- | --------------------------------------- | ------------------------------------------------ |
| **1** | **S07** | QEP domain event catalogue & publish    | Critical-path unlock for async product behaviour |
| 2     | S08     | TE outbox drain worker (L-03)           | Makes events operational                         |
| 3     | S09     | Retries, DLQ, idempotency, fairness     | Production-grade workers                         |
| 4     | S10     | Event failure evidence & reconciliation | Operability / trust                              |
| 5     | S11     | Search providers                        | User-visible discovery (needs S07 events)        |

Later bands (S12–S20, AI, Quality Intelligence, executive dashboards, frontend experience) remain on the approved roadmap but are **not** the immediate next authorisation.

### Governance programme status (context)

| Programme                              | Status                                  |
| -------------------------------------- | --------------------------------------- |
| APZHUB-ENG-002 Governance Foundation   | **COMPLETE**                            |
| APZHUB-ENG-002 Phase 1 (ES-001…ES-003) | **CLOSED**                              |
| Future ES promotions (ES-004+)         | **ON HOLD**                             |
| APZQEP-ENG-001                         | **ARCHIVED** (reference implementation) |

---

## 4. Recommended next engineering programme

| Field                          | Value                                                                                                           |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------- |
| **Recommended programme**      | **APZQEP-120-S07**                                                                                              |
| Title                          | QEP domain event catalogue and publication                                                                      |
| Objective                      | Promote `events/qep/*.yaml` to validated manifests; Platform Services publish via existing bus (foundation 029) |
| Effort (catalogue)             | M · 5–7 eng-days                                                                                                |
| Release boundary               | R1                                                                                                              |
| Authority required             | **Owner slice instruction** (not granted by this recommendation)                                                |
| Implementation under this pack | **NONE**                                                                                                        |

### Acceptance preview (from catalogue — not execution)

1. Key evidence/execution events publish with valid envelope (correlation, causation, tenant, user, audit).
2. Duplicate publish idempotent at bus/outbox layer.
3. No module direct notify/search.

---

## 5. Decision requested

Product Board / Owner:

```text
[ ] ACCEPT — Authorise APZQEP-120-S07 Owner slice instruction (separate prompt)
[ ] DEFER — Hold product engineering; keep STOP
[ ] REDIRECT — Name an alternate authorised programme
```

This document does **not** authorise implementation.

---

## Related

- [STANDING-PROGRAMME-RECORD.md](../../STANDING-PROGRAMME-RECORD.md)
- [SLICE-CATALOGUE.md](./SLICE-CATALOGUE.md) §S07
- [IMPLEMENTATION-SEQUENCE.md](./IMPLEMENTATION-SEQUENCE.md)
- [DEPENDENCY-MAP.md](./DEPENDENCY-MAP.md)
- [PHASE-1-CLOSED.md](../../../engineering/APZHUB-ENG-002/PHASE-1-CLOSED.md)
