# ENGINEERING-EXECUTION-PLAN — APZQEP-165-PLAN

| Field        | Value                                |
| ------------ | ------------------------------------ |
| Programme    | APZQEP-165-PLAN                      |
| Timestamp    | 20260804T060307Z                     |
| Architecture | FROZEN — PBR-APZQEP-165-000 APPROVED |

## Mission

Deliver `@apzhub/platform-orchestration` and APZQEP Quality Flow composition as **independently certifiable slices**, each Owner-authorised, evidenced, and reversible where practical — without revisiting frozen architecture.

## Engineering principles (mandatory)

1. Preserve approved architecture and platform boundaries.
2. Preserve provider neutrality — orchestration knows **contracts only**.
3. Preserve Quality Flow as the authoritative orchestration concept.
4. Avoid monolithic implementation.
5. Maximise independent certification; minimise regression and rollback risk.
6. Durable orchestration state required for production posture (not process-local SoR).
7. Human approval remains default for governed production release.
8. Reuse Event / Outbox / Processing platforms — no second bus.

## Delivery model

```text
Owner Auth (slice)
  → Engineering (slice only)
  → Tests (unit / integration / regression as scoped)
  → Security + docs review
  → Evidence pack
  → Slice completion / certification gate
  → Next slice Owner Auth
```

Whole-programme APZQEP-165 engineering is **not** opened as a single pass. Each slice requires separate Owner Authorisation (starting with **S01**).

## Intended packages / composition (from frozen architecture — not implemented here)

| Asset                             | Role                                                                     |
| --------------------------------- | ------------------------------------------------------------------------ |
| `@apzhub/platform-orchestration`  | Reusable orchestration platform                                          |
| Platform Services (orchestration) | Authz, validation, audit emit                                            |
| Thin `qep-*` composition          | APZQEP Quality Flow UX / config                                          |
| Peer platforms                    | Automation, SCM, QI, Evidence, Dashboard, Visualization (contracts only) |

## Contract-first rule

```text
Orchestration engine ↔ Automation Contract
Orchestration engine ↔ SCM Contract
Orchestration engine ↔ Evidence Contract
Orchestration engine ↔ QI Contract
Orchestration engine ↔ Dashboard Contract (consume projections)
Orchestration engine ↔ Reporting / Approval / Gate Contracts
```

Never peer implementations or provider clients.

## Sequencing summary

See [DEPENDENCY-MATRIX.md](./DEPENDENCY-MATRIX.md) for critical path.

Indicative waves of delivery:

1. **Foundation:** S01 → S02 → S04 (+ S10 early stubs)
2. **Ingress & policy:** S03 → S05 → S06
3. **Governance loop:** S07 → S08 → S09
4. **Peer integrations:** S11–S14 (parallelisable after contracts stable)
5. **Experience & API:** S16 → S15 → S17 (API before heavy UX where practical)
6. **Harden & certify:** S18 → entry to APZQEP-165R

## Programme exit

APZQEP-165 engineering programme completes when S01–S18 are certified per [CERTIFICATION-PLAN.md](./CERTIFICATION-PLAN.md), then APZQEP-165R operational readiness, then PBR-APZQEP-165.

## Explicit exclusions

No orchestration implementation under this plan programme. No architecture redesign. No APZQEP-166. No provider implementation.
