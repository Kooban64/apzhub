# APZQEP / APZHUB — Portfolio Status Snapshot

| Field     | Value                                             |
| --------- | ------------------------------------------------- |
| Date      | 2026-08-02                                        |
| Authority | Product Board — post APZQEP-120-S10 **CERTIFIED** |
| Status    | **IN FORCE**                                      |

---

## Programme portfolio

| Programme                | Status                                                              |
| ------------------------ | ------------------------------------------------------------------- |
| APZHUB Foundation        | ✅ Closed                                                           |
| APZHUB Product Framework | ✅ Closed                                                           |
| APZQEP v1.0 Release      | ✅ Closed                                                           |
| APZQEP v1.1 Planning     | ✅ Closed                                                           |
| APZQEP-120 S01–S10       | ✅ Complete · S10 Product Board **CERTIFIED**                       |
| APZQEP-120 S11           | ⏳ Recommended · Quality Knowledge Index · Owner Auth Pack required |
| APZQEP-ENG-001           | ✅ **Closed** (CERTIFIED / ARCHIVED)                                |
| APZHUB-ENG-002           | ✅ Foundation COMPLETE · Phase 1 CLOSED · ES promotions **ON HOLD** |

---

## Transition

```text
S01–S09  Platform engineering
S10      Product processor integration  ← CERTIFIED
S11+     User-facing capability
```

Platform foundation is essentially **complete**. Remaining work is predominantly end-user capability.

---

## Maturity snapshot (Board — post-S10 CERTIFIED)

| Area                  |  Completion |
| --------------------- | ----------: |
| Governance            |    **100%** |
| Engineering Framework |    **100%** |
| Evidence Platform     |    **~85%** |
| Event Platform        |    **~90%** |
| Backend               | **~82–84%** |
| Frontend              |    **~20%** |
| Overall Product       | **~75–77%** |

---

## Critical path

```text
S01–S10 ✅
        │
        ▼
S11  Quality Knowledge Index   ← next (Owner Auth Pack)
        │
        ▼
S12 Notifications → S13 Command Palette
        │
        ▼
S14 Suites → S15 Runs → S16 Execution → S17 Defects
        │
        ▼
S18 Traceability → S19 Reporting → S20 Close-out
```

---

## Platform rules (not ES promotions)

| Rule                                                                | Location                                                                                      |
| ------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| No product-private Outbox engines                                   | [OUTBOX-ARCHITECTURE.md](../v1.1/apzqep-120/OUTBOX-ARCHITECTURE.md)                           |
| Processing Engine executes registered processors only               | [PROCESSING-ENGINE.md](../v1.1/apzqep-120/PROCESSING-ENGINE.md)                               |
| Search consumes Event Platform (projections; eventually consistent) | [S11-PRODUCT-BOARD-RECOMMENDATION.md](../v1.1/apzqep-120/S11-PRODUCT-BOARD-RECOMMENDATION.md) |

---

## Related

- [S10-PRODUCT-BOARD-CERTIFICATION.md](../v1.1/apzqep-120/S10-PRODUCT-BOARD-CERTIFICATION.md)
- [S11-PRODUCT-BOARD-RECOMMENDATION.md](../v1.1/apzqep-120/S11-PRODUCT-BOARD-RECOMMENDATION.md)
- [BUSINESS-PROCESSORS.md](../v1.1/apzqep-120/BUSINESS-PROCESSORS.md)
- [STANDING-PROGRAMME-RECORD.md](../STANDING-PROGRAMME-RECORD.md)
