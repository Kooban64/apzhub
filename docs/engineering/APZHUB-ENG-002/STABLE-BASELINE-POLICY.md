# Stable Baseline Policy

| Field        | Value                                                                   |
| ------------ | ----------------------------------------------------------------------- |
| Document     | STABLE-BASELINE-POLICY                                                  |
| Programme    | APZHUB-ENG-002                                                          |
| Status       | **NORMATIVE** (permanent)                                               |
| Authority    | [Portfolio Engineering Charter](./PORTFOLIO-ENGINEERING-CHARTER.md) §13 |
| Adopted      | Product Board — 20260802T121525Z                                        |
| Applies when | Enterprise Engineering Baseline series declared **STABLE**              |

---

## Policy text

```text
Once an Enterprise Engineering Baseline is declared STABLE:

• New Enterprise Standards shall be treated as enhancements.

• Existing Enterprise Standards shall not be modified except through
  approved maintenance or supersession.

• Enterprise Baseline major versions shall only be created by
  Product Board decision.

• Minor versions shall continue to represent the activation of
  additional Enterprise Standards.

• Stability reviews shall occur only when requested by the Product Board
  or after major baseline revisions.
```

---

## Separation of change types

| Change type       | Meaning                                                 | Example                          |
| ----------------- | ------------------------------------------------------- | -------------------------------- |
| **Maintenance**   | Editorial / clarification without changing obligations  | Fix stale “when Active” phrasing |
| **Enhancement**   | New Active standard added to stable series (minor bump) | ES-004 → Baseline 1.3            |
| **Supersession**  | Replace an Active standard version under Dual Approval  | ES-001 v1.0 → v1.1               |
| **Re-baselining** | Major version (e.g. 2.0) — Board-declared restructuring | Only by Product Board            |

---

## Current application

| Series           | Status     | Current minor | Next enhancement candidate                      |
| ---------------- | ---------- | ------------- | ----------------------------------------------- |
| Baseline **1.x** | **STABLE** | **1.2**       | ES-004 (first enhancement — not yet authorised) |

---

## Related

- [BASELINE-1.x-STABLE.md](./BASELINE-1.x-STABLE.md)
- [PROMOTION-PRINCIPLES.md](./PROMOTION-PRINCIPLES.md)
- [APZHUB-ENTERPRISE-ENGINEERING-BASELINE.md](../APZHUB-ENTERPRISE-ENGINEERING-BASELINE.md)
