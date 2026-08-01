# Engineering Execution Plan — APZQEP-120

| Field          | Value                                                 |
| -------------- | ----------------------------------------------------- |
| Programme      | APZQEP-120 Enterprise Core Platform                   |
| Classification | Engineering Execution Planning                        |
| Architecture   | APZQEP-111 APPROVED                                   |
| Baseline       | APZQEP v1.0 COMPLETE · Evidence 1.0.0 · TE 1.0.1 · LA |
| Inspected HEAD | `4ff22aac6d250241383bda9c7b281b3bfc2c48d9`            |
| Implementation | **NOT AUTHORISED** by this document                   |

---

## Intent

Deliver a **safer, durable, operable** Enterprise Core on the released v1.0 baseline via **feature-slice engineering**, keeping the repository releasable after every slice. Do not rebuild completed v1.0 capabilities. Do not pull APZQEP-130+ scope.

---

## Delivery model

```text
Design confirmation → implement → unit → integration → security → docs → evidence
→ slice certification → clean commit → releasable repository
```

Default: **vertical capability slices**. Prefer security and boundary correctness before storage cutover.

---

## Workstream → slice map

| WS               | Slices                        |
| ---------------- | ----------------------------- |
| A Evidence       | S03–S06 (+ S01 ACL overlap B) |
| B Access         | S01–S02, S19                  |
| C TE operability | S08–S09, S15–S16              |
| D Events         | S07, S10                      |
| E Search         | S11–S12, S14                  |
| F Notifications  | S13                           |
| G Background     | S08–S10                       |
| H Observability  | S17                           |
| I Perf           | S18                           |
| J Security       | S05–S06, S19                  |
| Programme        | S20                           |

Full specs: [SLICE-CATALOGUE.md](./SLICE-CATALOGUE.md).

---

## Critical path

```text
S01 → S02 → [D-001] → S03 → S04 → S05 → S06
                ↘ S07 → S08 → S09 → S10
                         ↘ S11 → S12 → S13 → S14
                S15 ∥ S08   S16 after S08–S09+S02
                S17 after storage+worker+search
                S18 baselines → S19 security suite → S20 cert
```

---

## Parallelisation (safe)

| Parallel set                                                       | Constraint                                                      |
| ------------------------------------------------------------------ | --------------------------------------------------------------- |
| S15 ∥ S07–S09                                                      | Avoid same-day churn on TE public handlers without coordination |
| S14 ∥ S13                                                          | After S01                                                       |
| S17 metrics naming ∥ S18                                           | After probes exist                                              |
| **Do not parallel** S03+S04 on same migration without single owner | Shared schema/contracts                                         |

---

## High-risk / migration-sensitive

- **S03–S04** — persistence cutover; Owner D-001
- **S08** — worker concurrency/idempotency
- **S11–S12** — search leakage
- **S16** — live runner blast radius (flag mandatory)

---

## Owner decision blockers

| Decision                    | Blocks            |
| --------------------------- | ----------------- |
| D-001 ADR-0088 tech         | S03–S04 (hard)    |
| D-002 Retention             | S06 policy values |
| D-003 Max file size         | S04 limits        |
| D-004 Notify channels       | S13 email scope   |
| D-005 Scale/SLO assumptions | S18 targets       |
| D-006 Release packaging     | R2–R4 versioning  |

---

## Quality / security / release

See [QUALITY-PLAN.md](./QUALITY-PLAN.md), [SECURITY-PLAN.md](./SECURITY-PLAN.md), [RELEASE-STRATEGY.md](./RELEASE-STRATEGY.md).

---

## Programme boundary guardrails

**In:** Evidence hardening, TE operability, events/workers, search/notify foundations, obs, security gates, QI skeleton.  
**Out:** Suites/Runs/Defects, executive UX depth, AI, ALM sync, GA programme.

---

## Success definition (planning)

Pack complete; slices independently executable; no source/package/release mutation in APZQEP-120 planning commit.
