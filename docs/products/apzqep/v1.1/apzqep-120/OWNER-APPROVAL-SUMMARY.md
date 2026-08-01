# Owner Approval Summary — APZQEP-120 Planning

## Ask

1. **Approve** this Engineering Execution Plan as the authoritative slice catalogue for APZQEP-120.
2. **Decide** items in [DECISION-REGISTER.md](./DECISION-REGISTER.md) (especially **D-001 ADR-0088 storage technology**).
3. **Do not** grant blanket implementation authority for all of APZQEP-120.
4. After approval, authorise **only** the first slice (recommended: **APZQEP-120-S01**) via a separate Owner instruction.

## Why this plan

Repository inspection at `4ff22aac` shows v1.0 Evidence/TE are real, limited-availability capabilities with **enterprise gaps** (memory Evidence SoR, list ACL, enqueue-only outbox, partial search, no QEP notifications/health). Platform already provides event bus, outbox, search, ENF — **reuse, do not rebuild**.

## Recommended first slice

| ID                 | Title                              | Why first                                                                                |
| ------------------ | ---------------------------------- | ---------------------------------------------------------------------------------------- |
| **APZQEP-120-S01** | Evidence list/search ACL (L-EM-01) | Security boundary; no storage decision; independently releasable; unblocks TE ACL wiring |

## Critical path (summary)

```text
S01 ACL → S02 TE EvidenceAccessPort wiring
    → [D-001 Owner] → S03–S06 Evidence persistence/storage/hash/audit
    → S07–S10 Events + workers
    → S11–S14 Search / Notify / UCP foundation
    → S15–S17 TE OpenAPI / E2E / Observability
    → S18 QI skeleton → S19 Security suite → S20 Programme cert gate
```

## Numbers

| Metric                   | Value                     |
| ------------------------ | ------------------------- |
| Workstreams assessed     | 10 (A–J)                  |
| Slices defined           | 20 (S01–S20)              |
| Owner decisions required | 6 (see Decision Register) |
| High risks               | See R-001…R-012           |

## Explicit non-approvals sought

- No Suites/Runs/Defects in 120
- No AI implementation
- No unrestricted GA
- No package/version/tag mutation in planning

## Recommendation

**READY FOR PRODUCT BOARD REVIEW**
