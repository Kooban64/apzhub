# APZQEP / APZHUB — Portfolio Status Snapshot

| Field     | Value                                             |
| --------- | ------------------------------------------------- |
| Date      | 2026-08-02                                        |
| Authority | Product Board — post APZQEP-120-S11 **CERTIFIED** |
| Status    | **IN FORCE**                                      |

---

## Programme portfolio

| Programme                | Status                                                              |
| ------------------------ | ------------------------------------------------------------------- |
| APZHUB Foundation        | ✅ Closed                                                           |
| APZHUB Product Framework | ✅ Closed                                                           |
| APZQEP v1.0 Release      | ✅ Closed                                                           |
| APZQEP v1.1 Planning     | ✅ Closed                                                           |
| APZQEP-120 S01–S11       | ✅ Complete · S11 Product Board **CERTIFIED**                       |
| APZQEP-120 S12           | ⏳ Recommended · Notification & Subscription Platform · Owner Auth  |
| APZQEP-ENG-001           | ✅ **Closed** (CERTIFIED / ARCHIVED)                                |
| APZHUB-ENG-002           | ✅ Foundation COMPLETE · Phase 1 CLOSED · ES promotions **ON HOLD** |

---

## Architectural backbone

```text
Business Domain → Domain Events → Outbox → Delivery → Processing
  → Business Processors → Quality Knowledge Index → Search
```

Board assessment: architectural backbone of APZQEP is **effectively complete**. Remaining work is primarily product capability on a mature foundation.

---

## Maturity snapshot (Board — post-S11 CERTIFIED)

| Area                  | Completion |
| --------------------- | ---------: |
| Governance            |   **100%** |
| Engineering Framework |   **100%** |
| Evidence Platform     |    **90%** |
| Event Platform        |    **95%** |
| Knowledge Platform    |    **70%** |
| Backend               | **85–87%** |
| Frontend              | **20–25%** |
| Overall Product       | **78–80%** |

Backend architecture entering final maturity phase.

---

## Critical path

```text
S01–S11 ✅
        │
        ▼
S12  Notification & Subscription Platform  ← next (Owner Auth Pack)
        │
        ▼
S13 Command Palette
        │
        ▼
S14 Suites → S15 Runs → S16 Execution → S17 Defects
        │
        ▼
S18 Traceability → S19 Reporting → S20 Close-out
```

---

## Platform rules (not ES promotions)

| Rule                                                  | Location                                                                                      |
| ----------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| No product-private Outbox engines                     | [OUTBOX-ARCHITECTURE.md](../v1.1/apzqep-120/OUTBOX-ARCHITECTURE.md)                           |
| Processing Engine executes registered processors only | [PROCESSING-ENGINE.md](../v1.1/apzqep-120/PROCESSING-ENGINE.md)                               |
| Search consumes Event Platform (projections)          | [QUALITY-KNOWLEDGE-INDEX.md](../v1.1/apzqep-120/QUALITY-KNOWLEDGE-INDEX.md)                   |
| Notifications subscribe to QKI or Domain Events       | [S12-PRODUCT-BOARD-RECOMMENDATION.md](../v1.1/apzqep-120/S12-PRODUCT-BOARD-RECOMMENDATION.md) |

---

## Related

- [S11-PRODUCT-BOARD-CERTIFICATION.md](../v1.1/apzqep-120/S11-PRODUCT-BOARD-CERTIFICATION.md)
- [S12-PRODUCT-BOARD-RECOMMENDATION.md](../v1.1/apzqep-120/S12-PRODUCT-BOARD-RECOMMENDATION.md)
- [QUALITY-KNOWLEDGE-INDEX.md](../v1.1/apzqep-120/QUALITY-KNOWLEDGE-INDEX.md)
- [STANDING-PROGRAMME-RECORD.md](../STANDING-PROGRAMME-RECORD.md)
