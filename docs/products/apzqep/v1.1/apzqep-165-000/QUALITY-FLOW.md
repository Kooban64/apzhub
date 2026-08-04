# QUALITY-FLOW — APZQEP-165-000

| Field     | Value            |
| --------- | ---------------- |
| Programme | APZQEP-165-000   |
| Timestamp | 20260804T054651Z |

## Definition

A **Quality Flow** is a versioned, auditable orchestration definition that maps triggers → correlation → capability steps → gates → approval → release recommendation/decision.

Orchestration defines the flow. Capabilities execute their own work.

## Canonical enterprise flow

```text
Source change / trigger
        ↓
Impact correlation
        ↓
Quality Flow selection
        ↓
Capability orchestration (registered contracts)
        ↓
Evidence collection (capability-owned; orchestration awaits completeness)
        ↓
Quality Intelligence evaluation
        ↓
Quality Gates
        ↓
Human Approval (default for production-bound)
        ↓
Release Recommendation
        ↓
Release Governance decision (GO / NO-GO / conditional / deferred / rejected)
```

## Flow run lifecycle

```text
RECEIVED → CORRELATING → SELECTING → RUNNING → AWAITING_EVIDENCE
→ EVALUATING → GATING → AWAITING_APPROVAL → RECOMMENDING
→ DECIDED → COMPLETED
                 ↘ FAILED
                 ↘ CANCELLED
                 ↘ TIMED_OUT
                 ↘ WAIVED (terminal only with audited waiver path)
```

| State             | Meaning                                            |
| ----------------- | -------------------------------------------------- |
| RECEIVED          | Trigger accepted; correlation id assigned          |
| CORRELATING       | Impact context gathering                           |
| SELECTING         | Flow + selection policy resolution                 |
| RUNNING           | Capability steps in progress                       |
| AWAITING_EVIDENCE | Waiting on evidence completeness signals           |
| EVALUATING        | QI evaluation requested / in progress              |
| GATING            | Gate composition evaluation                        |
| AWAITING_APPROVAL | Human approval outstanding                         |
| RECOMMENDING      | Release recommendation assembled                   |
| DECIDED           | GO / NO-GO / conditional / deferred / rejected set |
| COMPLETED         | Terminal success path (decision recorded)          |
| FAILED            | Unrecoverable orchestration or capability failure  |
| CANCELLED         | Explicit cancel                                    |
| TIMED_OUT         | Policy timeout                                     |
| WAIVED            | Terminal via audited waiver (exceptional)          |

## Flow definition elements

- `flowId`, `version`, `name`
- Trigger bindings
- Selection policy ref
- Ordered / parallel capability steps (by `capabilityId` + operation)
- Gate policy ref
- Approval policy ref
- Release decision policy ref
- Retry / timeout / concurrency / environment targeting policies
- Permission requirements
- Environment class (dev / qa / uat / production)

## SoR rules

- Flow **definitions** and **run state** → Orchestration SoR
- Step outcomes → references to peer platform ids
- Never copy Automation results, QI scores, or Evidence blobs into orchestration as authoritative duplicates (cache/projection allowed, non-authoritative)

## Parallelism

Flows may declare parallel capability steps where contracts allow. Join gates wait for declared completeness. Concurrency limits are policy, enforced by orchestration + capability contracts.
