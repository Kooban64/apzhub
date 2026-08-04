# OPERATING-MODEL — APZQEP-165-000

| Field     | Value            |
| --------- | ---------------- |
| Programme | APZQEP-165-000   |
| Timestamp | 20260804T054651Z |

## Environments

| Environment | Orchestration posture                                       |
| ----------- | ----------------------------------------------------------- |
| Development | Fast flows; advisory QI; human approval optional by policy  |
| QA          | Broader selection; gates on; approvals for promotion        |
| UAT         | Production-like gates; mandatory approvals for release cand |
| Production  | Fail-closed defaults; human approval required by default    |
| Emergency   | Dual-control override path; mandatory post-review           |

## Governed promotion

```text
Dev flow evidence → QA flow → UAT flow → Production release decision
```

Each stage is a Quality Flow (or chained flows) with escalating gate/approval policies. Promotion is **orchestrated**, not implied by dashboard status.

## Rollback

Rollback is a **release governance action** potentially triggering a compensatory Quality Flow (verification after rollback). Orchestration records the decision linkage; deployment mechanics remain outside orchestration SoR.

## Operational review & continuous improvement

- Failed flows, waivers, and emergency overrides feed ops review
- Policy versions evolve via change control (not hot UI edits without audit)
- Metrics: flow success rate, gate fail reasons, approval latency, waiver rate

## Operator runbooks (architecture requirements)

Engineering/ops readiness (165R) must later provide runbooks for:

- Stuck AWAITING_APPROVAL / AWAITING_EVIDENCE
- Capability timeout / DLQ replay
- QI low-confidence storms
- Emergency override post-incident
- Mistaken GO compensating decision

## Continuous quality loop (operating characterisation)

```text
Events → Orchestration → Registered capabilities → Evidence → QI → Gates → Human approval → Governed release
```
