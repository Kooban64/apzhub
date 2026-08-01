# Implementation Roadmap — APZQEP v1.1+

Maps architecture to time-ordered delivery. Not an authorisation to code.

---

## Wave plan

| Wave | Programmes                        | Outcome                               | Product version |
| ---- | --------------------------------- | ------------------------------------- | --------------- |
| W0   | APZQEP-111                        | Architecture approved                 | —               |
| W1   | APZQEP-120                        | Trust + discovery + QI skeleton       | 1.1 foundation  |
| W2   | APZQEP-130                        | Suites · Runs · Defects               | 1.1 core        |
| W3   | APZQEP-140                        | Home · dashboards · readiness         | 1.1 experience  |
| W4   | APZQEP-150                        | AI assist MVP                         | 1.1 AI-native   |
| W5   | Cert/Freeze/Release for 1.1 slice | Limited release of 1.1                | **1.1**         |
| W6   | APZQEP-160 · 170                  | Coverage, cert engine, ALM, exec dash | **1.2**         |
| W7   | APZQEP-180                        | Ops excellence · GA readiness         | **1.3**         |
| W8   | APZQEP-200 (future arch)          | Portfolio QE                          | **2.0**         |

---

## Critical path (1.1)

```text
111 APPROVED
    → APZQEP-120 planning COMPLETE (see apzqep-120/)
    → Board review 120 plan + D-001 (ADR-0088)
    → Per-slice Owner directives (S01 → … → S20)
    → 130 (Suites → Runs → Defects)
    → 140 (UX)
    → 150 (AI)  [may overlap late 130/140 with care]
    → 1.1 certification & limited release
```

Slice sequence detail: [apzqep-120/IMPLEMENTATION-SEQUENCE.md](./apzqep-120/IMPLEMENTATION-SEQUENCE.md).

---

## Parallelisation guidance

| Safe parallel                          | Risky parallel                                     |
| -------------------------------------- | -------------------------------------------------- |
| 120B TE harden ∥ 120C Discovery        | Evidence storage migration ∥ heavy schema rewrites |
| Suites before Runs (serial inside 130) | AI writes before search/RAG ready                  |
| Dashboard mock with QI stubs           | Claiming GA during 1.1                             |

---

## Definition of implementation ready (per programme)

1. Owner programme directive issued
2. Architecture section referenced from this pack
3. `service.yaml` / `module.yaml` / `event.yaml` drafted before code
4. Acceptance criteria from [ENGINEERING-PROGRAMMES.md](./ENGINEERING-PROGRAMMES.md)
5. Lifecycle stage gates applied

---

## Alignment with APZQEP-110

| 110 theme          | Implementation wave |
| ------------------ | ------------------- |
| T1 Trust           | W1 / 120            |
| T2 Operating model | W2 / 130            |
| T3 Discovery       | W1 / 120            |
| T4 Insight         | W3 / 140            |
| T5 AI              | W4 / 150            |
| T6 Enterprise      | W6+                 |

---

## STOP

```text
IMPLEMENTATION ROADMAP
PLANNING ARTIFACT ONLY
NO ENGINEERING AUTHORISED BY THIS DOCUMENT ALONE
```
