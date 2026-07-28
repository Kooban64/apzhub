# Release 1.2 — Implementation Sequence

> **Programme:** APZHUB-1.2-001  
> **Date:** 2026-07-20  
> **Note:** Sequence for **named delivery programmes** after Owner Acceptance of this plan.

---

## Waves

```text
Wave 0  Plan acceptance (this programme) — docs only
Wave 1  Operational maturity (OPS-01…03) + Security/Compliance continuous
Wave 2  Search publishers (SEARCH-01/02) ∥ TCMS GitLab (TCMS-01)
Wave 3  Persistence honesty (PERSIST-01/02)
Wave 4  Support CE depth (SUP-01 and/or SUP-02)
Wave 5  Selective automation intents (AUTO-01)
Wave 6  Product polish (LAW-01, TIME-01, PROJ-01 as capacity)
Wave 7  Hygiene (SEMVER-01, QA-02) + portfolio re-cert (QA-01)
Wave 8  Platform 1.2.0 packaging & certification (future programme)
```

## Parallelisation

| Parallel set | Items                                                |
| ------------ | ---------------------------------------------------- |
| Set α        | OPS-* with SEARCH-* / TCMS-01                        |
| Set β        | PERSIST-* after Automation/Law owners ready          |
| Set γ        | SUP-* independent of Search once connector env ready |
| Set δ        | Product polish after AuthZ/persist prerequisites     |

## Gate between waves

Each wave ends with: tests green · docs/KL update · Owner Acceptance of that delivery programme · no STOP leakage.
