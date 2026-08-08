# APZHUB Portfolio Status

| Field               | Value                                                                                                                                                                                                                                                  |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Timestamp           | 20260808T153000Z                                                                                                                                                                                                                                       |
| Authority           | Owner operating face — one-page dashboard                                                                                                                                                                                                              |
| Complements         | [APZHUB-PRODUCT-PORTFOLIO-READINESS-SUMMARY.md](./APZHUB-PRODUCT-PORTFOLIO-READINESS-SUMMARY.md) · [APZHUB-PORTFOLIO-OPERATING-PRINCIPLE.md](./APZHUB-PORTFOLIO-OPERATING-PRINCIPLE.md) · [APZHUB-DELIVERY-STANDARD.md](./APZHUB-DELIVERY-STANDARD.md) |
| Rule                | Observation / planning only — does not authorise engineering                                                                                                                                                                                           |
| Operating principle | **No Engineering Execution without a finite closeout inventory**                                                                                                                                                                                       |
| Delivery standard   | Assess → finite inventory → engineer → readiness → harden → RC → Production Ready → Operational Learning                                                                                                                                               |

---

## Product classes

| Class                     | Products                      | Role                                                    |
| ------------------------- | ----------------------------- | ------------------------------------------------------- |
| **Engineering Platform**  | APZQEP · APZ Workflow         | Quality, release governance, business-process companion |
| **Delivery Platform**     | APZ Projects                  | Plan and deliver work                                   |
| **Operational Platform**  | APZ Support · APZ Time        | Day-to-day service and time capture                     |
| **Intelligence Platform** | APZ Analytics · APZ Knowledge | Insight, reporting, organisational memory               |

---

## Portfolio by maturity

| Status               | Products                                               |
| -------------------- | ------------------------------------------------------ |
| **Production Ready** | APZ Projects · APZQEP · APZ Workflow                   |
| **Operational**      | APZ Support · APZ Time · APZ Analytics · APZ Knowledge |
| **In Engineering**   | _(none currently authorised)_                          |
| **Assessment**       | _(none)_                                               |

### Scoreboard

| Product       | Status           |
| ------------- | ---------------- |
| APZ Projects  | Production Ready |
| APZQEP        | Production Ready |
| APZ Workflow  | Production Ready |
| APZ Support   | Operational      |
| APZ Analytics | Operational      |
| APZ Knowledge | Operational      |
| APZ Time      | Operational      |

---

## Product rows

| Product           | Class        | Status                        | Baseline                         | Est. effort remaining                 | Notes                                        |
| ----------------- | ------------ | ----------------------------- | -------------------------------- | ------------------------------------- | -------------------------------------------- |
| **APZQEP**        | Engineering  | **Production Ready** · CLOSED | V1.1 (`apzqep-v1.1.0`)           | Defects / hotfixes only               | Operational Learning; V1.2 via Product Board |
| **APZ Projects**  | Delivery     | **Production Ready** · CLOSED | Release 3.0 (`apz-projects-3.0`) | Defects / hotfixes only               | Operational Learning; 3.1 backlog only       |
| **APZ Workflow**  | Engineering  | **Production Ready** · CLOSED | V1.0 (`apz-workflow-1.0`)        | Defects / hotfixes only               | Operational Learning; execute unlock → 1.1+  |
| **APZ Support**   | Operational  | Operational                   | RI / native freeze               | Ops learning + Board-gated investment | Next elevate candidate when authorised       |
| **APZ Time**      | Operational  | Operational                   | 1.0.0                            | Ops learning + Board-gated investment | Reference Implementation #001                |
| **APZ Analytics** | Intelligence | Operational                   | 1.0.0 packaging                  | Acceptance / ops confirmation         | Awaiting Acceptance historically             |
| **APZ Knowledge** | Intelligence | Operational                   | Capability / native packs        | Ops learning + Board-gated investment | —                                            |

---

## Recommended execution order

1. ✅ **APZ Projects** — Production Ready (operate / learn)
2. ✅ **APZQEP** — Production Ready (operate / learn)
3. ✅ **APZ Workflow** — Production Ready (operate / learn)
4. **APZ Support** — elevate Operational → Production Ready when authorised (assessment → inventory first)
5. **APZ Analytics**
6. **APZ Knowledge**
7. **APZ Time**

**Immediate next action:** Operational Learning on Projects · APZQEP · Workflow. Next engineering product only after Owner-authorised assessment (four questions → finite inventory).

---

## Delivery model (proven)

Canonical: [APZHUB-DELIVERY-STANDARD.md](./APZHUB-DELIVERY-STANDARD.md)

```text
Assess → Finite inventory → Continuous engineering → Production readiness
→ Hardening → Release Candidate → Production Ready → Operational Learning
```

Applied successfully to **APZ Projects**, **APZQEP**, and **APZ Workflow**. Protect the inventory. Finish. Then move on.
