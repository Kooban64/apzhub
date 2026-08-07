# Slice 3 — Operational Delivery — Status

| Field     | Value                                                        |
| --------- | ------------------------------------------------------------ |
| Authority | Workshop 004 + Owner FUNCTIONALLY ACCEPTED 2026-08-07        |
| Status    | **FUNCTIONALLY ACCEPTED** — Release 3.0 engineering baseline |
| Principle | Behaviour first; presentation second                         |

## Owner decision

**FUNCTIONALLY ACCEPTED** into the Release 3.0 engineering baseline. The operational execution engine is complete. Remaining items are **production readiness** (gates P1–P5), not product design gaps.

UX engineering is authorised next (Cockpit FocusNav first) per Owner priority order.

## Priority progress

| Priority | Scope                   | Status                                                                                               |
| -------- | ----------------------- | ---------------------------------------------------------------------------------------------------- |
| 1        | Milestone Engine (W004) | **Accepted** — lifecycle, evidence, variance, baseline compare, history, silent-date ban + Exception |
| 2        | Exception Automation    | **Accepted** — scan for milestone/wait/commitment/dependency/checkpoint; idempotent raise            |
| 3        | Control Surface         | **Accepted** — `/control` + Control intent surface                                                   |
| 4        | Portfolio Projection    | **Accepted** — `/portfolio?level=` Project→Programme→Initiative→Enterprise roll-up                   |
| 5        | Production Gates P1–P5  | **BLOCKING** certification — not product gaps                                                        |

## Milestone Engine

- Statuses: `planned` · `at_risk` · `slipped` · `achieved` · `cancelled` (legacy aliases normalised)
- Fields: ownerUserId, confidence, failureConsequence, exitCriteria, baselineDueAt, sortKey, achievementEvidence, varianceDays
- Achieve requires evidence (unless `evidenceOptional`)
- Date move beyond Governance Profile `milestoneDateToleranceDays` **requires** `dateChangeReason` and raises `date_exception`
- Operational History on create / update / achieve
- Migration `0113_apz_platform_milestones_w004.sql`

## Exception Automation

- `POST …/exceptions/scan` runs detectors:
  - milestone variance / slipped
  - wait breach (SLA + escalation days)
  - commitment breach (overdue high/blocking)
  - dependency broken
  - checkpoint rejected
- Each draft includes severity, impact, recommended action
- Idempotent against open exceptions for same subject

## Control Surface

- `GET …/control`
- Control intent / surface on Project Cockpit

## Portfolio Projection

- `GET /api/v1/projects/portfolio?level=project|programme|initiative|enterprise`
- Rolls up Health, Confidence, Exceptions, Waiting, Dependencies, Forecast

## Production certification gates (BLOCKING)

| ID  | Gate                                                                                      | State        |
| --- | ----------------------------------------------------------------------------------------- | ------------ |
| P1  | APZ Workflow Bridge                                                                       | **BLOCKING** |
| P2  | Enterprise Identity Pickers                                                               | **BLOCKING** |
| P3  | Organisation Governance Administration                                                    | **BLOCKING** |
| P4  | Migration Verification                                                                    | **BLOCKING** |
| P5  | Full Certification (unit · integration · API · UI · a11y · performance · migration · E2E) | **BLOCKING** |

## Known engineering notes (non-blocking for functional acceptance)

- Programme/Initiative hierarchy uses lifecycle `programmeId` + simple grouping — fuller W005 Portfolio SoR may deepen later
- Recommended actions on Exceptions primarily from detection (persist enrichment optional)
- Full certification suite (P5) not yet executed end-to-end

## Next (post-acceptance)

1. Cockpit Focus Navigation (UX #1) — in progress / landing
2. Operational Workspace refinement → Portfolio UI → … per Owner UX order
3. Advance production gates P1–P5 when Owner prioritises certification
