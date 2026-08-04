# RELEASE-ARCHITECTURE — APZQEP-165-000

| Field     | Value            |
| --------- | ---------------- |
| Programme | APZQEP-165-000   |
| Timestamp | 20260804T054651Z |

## Purpose

Design the **release recommendation and decision** model orchestrated by Continuous Quality Orchestration.  
Release **authority** remains human-governed by default. Dashboards never own GO.

## Decision outcomes

| Outcome       | Meaning                                          |
| ------------- | ------------------------------------------------ |
| `GO`          | Governed approval to proceed with release action |
| `NO_GO`       | Release must not proceed                         |
| `CONDITIONAL` | Proceed only with stated conditions / follow-ups |
| `DEFERRED`    | Decision postponed; flow may resume              |
| `REJECTED`    | Explicit rejection (stronger than defer)         |

## Recommendation vs decision

| Artifact               | Producer                          | Binding                         |
| ---------------------- | --------------------------------- | ------------------------------- |
| Release readiness view | Projection from gates/QI/evidence | Informational                   |
| Release recommendation | Orchestration (+ QI inputs)       | Advisory unless policy binds    |
| Release decision       | Authorised human (default)        | Authoritative for governed path |

## Decision record (SoR: orchestration)

```text
ReleaseDecision {
  decisionId
  flowRunId
  correlationId
  outcome
  decidedBy (identity)
  decidedAt
  rationale
  conditions[]
  evidenceRefs[]
  gateSnapshotRef
  qiEvaluationRefs[]
  approvalRefs[]
  waiverRefs[]
  explainabilityRef
  searchableProjection (QKI)
}
```

Records are **immutable**. Corrections are new decisions linked by causation.

## Explainability

Each decision links to:

- Gate results
- QI explainability payloads (capability-owned)
- Correlation context summary
- Approval / waiver chain

## Search & evidence

- Decisions projected to QKI / search for compliance retrieval
- Evidence remains in Evidence Platform; decision stores refs only
- Reporting may consume decision projections — not own them

## Explicitly out of scope for autonomous GO (Wave 5)

- Unmanaged autonomous production GO
- UI button that sets production GO without Platform Service + authz + audit
- QI high score alone as production GO
- Silent superadmin GO

## Constrained automation (future Board topic)

Architecture allows a **later** Board-approved, audited, constrained auto-decision path for non-production or narrowly scoped cases. Not authorised by this programme.
