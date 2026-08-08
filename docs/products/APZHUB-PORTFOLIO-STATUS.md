# APZHUB Portfolio Status

| Field       | Value                                                                                            |
| ----------- | ------------------------------------------------------------------------------------------------ |
| Timestamp   | 20260808T080100Z                                                                                 |
| Authority   | Owner operating face — one-page dashboard                                                        |
| Complements | [APZHUB-PRODUCT-PORTFOLIO-READINESS-SUMMARY.md](./APZHUB-PRODUCT-PORTFOLIO-READINESS-SUMMARY.md) |
| Rule        | Observation / planning only — does not authorise engineering                                     |

---

## Product classes

| Class                     | Products                      | Role                                                          |
| ------------------------- | ----------------------------- | ------------------------------------------------------------- |
| **Engineering Platform**  | APZQEP · APZ Workflow (next)  | Quality, release governance, automation of engineering change |
| **Delivery Platform**     | APZ Projects                  | Plan and deliver work                                         |
| **Operational Platform**  | APZ Support · APZ Time        | Day-to-day service and time capture                           |
| **Intelligence Platform** | APZ Analytics · APZ Knowledge | Insight, reporting, organisational memory                     |

---

## Portfolio by maturity

| Status               | Products                                               |
| -------------------- | ------------------------------------------------------ |
| **Production Ready** | APZ Projects · APZQEP                                  |
| **Operational**      | APZ Support · APZ Time · APZ Analytics · APZ Knowledge |
| **In Engineering**   | _(none currently authorised)_                          |
| **Planned**          | APZ Workflow (next engineering priority)               |

---

## Product rows

| Product           | Class        | Status                        | Baseline                                  | Est. effort remaining                 | Notes                                        |
| ----------------- | ------------ | ----------------------------- | ----------------------------------------- | ------------------------------------- | -------------------------------------------- |
| **APZQEP**        | Engineering  | **Production Ready** · CLOSED | V1.1 (`apzqep-v1.1.0`)                    | Defects / hotfixes only               | Operational Learning; V1.2 via Product Board |
| **APZ Projects**  | Delivery     | **Production Ready** · CLOSED | Release 3.0 (`apz-projects-3.0`)          | Defects / hotfixes only               | Operational Learning; 3.1 backlog only       |
| **APZ Support**   | Operational  | Operational                   | RI / native freeze                        | Ops learning + Board-gated investment | Not next engineering priority                |
| **APZ Time**      | Operational  | Operational                   | 1.0.0                                     | Ops learning + Board-gated investment | Reference Implementation #001                |
| **APZ Analytics** | Intelligence | Operational                   | 1.0.0 packaging                           | Acceptance / ops confirmation         | Awaiting Acceptance historically             |
| **APZ Knowledge** | Intelligence | Operational                   | Capability / native packs                 | Ops learning + Board-gated investment | —                                            |
| **APZ Workflow**  | Engineering  | **Planned**                   | Platform production · commercial planning | **TBD** — inventory session first     | Next engineering priority                    |

---

## Recommended execution order

1. ✅ **APZ Projects** — Production Ready (operate / learn)
2. ✅ **APZQEP** — Production Ready (operate / learn)
3. 🎯 **APZ Workflow** — next: assessment → finite inventory → then closeout method (not “build Workflow” yet)
4. **APZ Support** — elevate Operational → Production Ready if evidence requires
5. **APZ Analytics**
6. **APZ Knowledge**
7. **APZ Time**

**Immediate next action:** Workflow assessment only — what exists, what is missing, what Production Ready means, shortest path. No Workflow Engineering Execution until inventory exists.

---

## Delivery model (proven)

```text
Finite inventory → Continuous engineering → Production readiness
→ Hardening → Release Candidate → Production Ready → Operational Learning
```

Applied successfully to **APZ Projects** and **APZQEP**. Standard for remaining portfolio products.
