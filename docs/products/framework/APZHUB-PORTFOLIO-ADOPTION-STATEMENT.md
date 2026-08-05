# APZHUB Portfolio Adoption Statement

| Field     | Value                                              |
| --------- | -------------------------------------------------- |
| Status    | **GOVERNING**                                      |
| Timestamp | 20260805T035900Z                                   |
| Authority | Owner direction post REFERENCE IMPLEMENTATION #001 |

## Formal portfolio statement

> **APZ Time is the first APZHUB Reference Implementation. Future products shall follow the APZHUB Product Native Adoption Standard and APZQEP Enterprise Quality Baseline, with sequencing determined by portfolio priority and operational evidence.**

## Gear change (in force)

| Was                                        | Is                                                   |
| ------------------------------------------ | ---------------------------------------------------- |
| APZQEP is the project                      | **APZHUB is the project**                            |
| Programme → Slice → Certification → Freeze | **Portfolio → Product → Business Value**             |
| Create standards                           | **Stop** — reuse Native Adoption + Playbook + APZQEP |
| Build products                             | **Mature the APZHUB portfolio**                      |

APZQEP is **infrastructure**. Discuss it only on release learning, justified provider work, or operational evidence.

### Three layers

| Layer                   | Focus                                                       | Status             |
| ----------------------- | ----------------------------------------------------------- | ------------------ |
| 1 — Platform Foundation | Identity, SDK, standards, APZQEP, Native Adoption, Playbook | **Mature**         |
| 2 — Product Experience  | Indistinguishable APZHUB products (not wrappers)            | **Active focus**   |
| 3 — Business Capability | What users buy into                                         | **Value delivery** |

## Shift in programme thinking

| Was                                            | Is                                                           |
| ---------------------------------------------- | ------------------------------------------------------------ |
| Product engineering (“What do we build next?”) | **Portfolio engineering**                                    |
| Invent methodology per product                 | **Reuse** Native Adoption + APZQEP (no TIME-NATIVE redesign) |
| Next programme because previous finished       | Next programme because **business value** demands it         |

## Product maturity lifecycle

Every APZHUB product should move through the same states:

```text
Concept
        │
        ▼
Production (Existing Capability)
        │
        ▼
Native Adoption
        │
        ▼
APZQEP Adoption
        │
        ▼
Reference Implementation (optional — earned)
        │
        ▼
Operational Learning
        │
        ▼
Capability Expansion
```

APZ Time has completed this journey through Operational Learning readiness; Capability Expansion remains intentionally deferred.

## Reference Implementations are earned, not designated

A product may be nominated as a Reference Implementation only when **all** apply:

| Criterion                            | Required                            |
| ------------------------------------ | ----------------------------------- |
| Native Adoption complete (N-01…N-03) | Yes                                 |
| APZQEP Adoption complete (N-04)      | Yes                                 |
| Operational use demonstrated         | Yes                                 |
| Operational learning collected       | Yes (for subsequent RIs after #001) |
| Stable production operation          | Yes                                 |
| Portfolio approval                   | Yes                                 |

**REFERENCE IMPLEMENTATION #001 (APZ Time)** is the founding designation that proved the path. Later designations must meet the earned criteria above — including demonstrated operational learning — so the title remains meaningful.

## Recommended portfolio priority (business value)

Owner-directed scoring for daily operational payoff (not technical completeness):

| Priority | Product          | Business value | Current maturity | Notes                                                        |
| -------: | ---------------- | -------------: | ---------------: | ------------------------------------------------------------ |
|    **1** | **APZ Support**  |     ⭐⭐⭐⭐⭐ |          Partial | Highest day-to-day ticket interaction — **recommended next** |
|    **2** | APZ Projects     |     ⭐⭐⭐⭐⭐ |          Partial | After Support unless portfolio reverses                      |
|    **3** | APZ Documents    |       ⭐⭐⭐⭐ |          Partial |                                                              |
|    **4** | APZ Workflow     |       ⭐⭐⭐⭐ |          Partial |                                                              |
|    **5** | APZ Analytics    |         ⭐⭐⭐ |          Partial |                                                              |
|    Later | APZ Law Platform |      Strategic |          Planned | Product development, not next native adoption by default     |

**Illustrative quarterly sketch (not authorised programmes):**

| Quarter | Objective                                    |
| ------- | -------------------------------------------- |
| Q1      | APZ Time (Reference) ✅                      |
| Q2      | APZ Support (Native) — when Owner Auth opens |
| Q3      | APZ Projects (Native)                        |
| Q4      | APZ Documents (Native)                       |

APZQEP does not appear on that roadmap — it is infrastructure.

**APZ-SUPPORT-000** mission pack: [../apzsupport/](../apzsupport/) — **COMPLETE**, awaiting Owner approval.  
**No SUPPORT-NATIVE programme** until the mission is formally agreed + separate Owner Auth.  
Apply the Playbook as-is — no redesign.

## Standing constraints

- Do not open the next product programme solely because TIME-NATIVE-001 finished
- Do not invent new standards before real releases exercise the current ones
- Do not designate the next Reference Implementation by default
- Do not repeat TIME-NATIVE-001 methodology design for the next product
- Portfolio dashboard (documentation) may follow when Owner requests

## Related

| Artefact                      | Path                                                                                                     |
| ----------------------------- | -------------------------------------------------------------------------------------------------------- |
| Native Adoption Standard      | [APZHUB-PRODUCT-NATIVE-ADOPTION-STANDARD.md](./APZHUB-PRODUCT-NATIVE-ADOPTION-STANDARD.md)               |
| Adoption Playbook             | [APZHUB-PRODUCT-ADOPTION-PLAYBOOK.md](./APZHUB-PRODUCT-ADOPTION-PLAYBOOK.md)                             |
| RI #001                       | [../apztime/REFERENCE-IMPLEMENTATION-001.md](../apztime/REFERENCE-IMPLEMENTATION-001.md)                 |
| TIME-NATIVE freeze            | [../time/APZHUB-TIME-NATIVE-001/PROGRAMME-FREEZE.md](../time/APZHUB-TIME-NATIVE-001/PROGRAMME-FREEZE.md) |
| Existing portfolio governance | [../../governance/PORTFOLIO-GOVERNANCE.md](../../governance/PORTFOLIO-GOVERNANCE.md)                     |
