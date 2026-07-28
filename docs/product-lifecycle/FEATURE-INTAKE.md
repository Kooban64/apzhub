# Feature Intake & Improvement Processes

> **Programme:** APZHUB-PRODUCT-LIFECYCLE-001  
> **Date:** 2026-07-20

---

## Common intake record (minimum)

| Field                               | Required                                                                 |
| ----------------------------------- | ------------------------------------------------------------------------ |
| Title / outcome                     | Yes                                                                      |
| Source                              | Customer · Internal · Ops · Security · Compliance · Incident · Debt scan |
| Classification                      | Yes (backlog legend)                                                     |
| Affected product / platform surface | Yes                                                                      |
| Business / risk value               | Yes                                                                      |
| Acceptance criteria (draft)         | Yes                                                                      |
| Architecture touchpoints            | Yes (services / connectors / freezes)                                    |
| STOP risk?                          | Yes / No + note                                                          |
| Proposed priority                   | P0–P3                                                                    |

Intake creates a **backlog candidate**, not engineering authorisation.

---

## Feature intake

1. Capture request with acceptance criteria and persona/value.
2. Map to Platform Service / Module / Connector boundaries (no Module→Connector designs).
3. Product Owner ranks; Architect flags freeze/ADR needs.
4. Enter continuous backlog; await Owner Approval for execution.

## Customer request process

1. Log request (support/ops/commercial channel) with customer context (no secrets).
2. Distinguish defect vs enhancement vs limitation (KL honesty).
3. Defects → Hotfix or defect backlog; enhancements → feature intake.
4. Communicate PRWL / KL constraints when request exceeds certified surface.

## Operational improvement process

1. Source: ops risks, drill evidence, runbook gaps, coexistence audits.
2. Prefer documentation/runbook fixes first; engineering only when justified.
3. Tie to OPERATIONAL-RISK-REGISTER IDs when applicable.
4. Owner Approval for material platform changes.

## Technical debt process

1. Tag debt with cost-of-delay and freeze risk.
2. Bound scope (no “cleanup while here”).
3. Prefer dedicated debt items in quarterly trains.
4. Pin-drift / SemVer hygiene as explicit items (from 1.2 PIR lessons).

## Security improvement process

1. Triage severity (align incident / Zero Trust).
2. S1/S2 → expedited Owner path + Hotfix if Production.
3. Non-emergency → security-classified backlog items.
4. Never weaken authz/audit for convenience.

## Compliance improvement process

1. Source: audits, certification gaps, evidence currency.
2. Prefer continuous certification updates (see [CONTINUOUS-CERTIFICATION.md](./CONTINUOUS-CERTIFICATION.md)).
3. Material control changes require Owner Approval + docs.

## Incident-driven improvements

1. Stabilize via Incident + Hotfix standards.
2. Mandatory follow-up backlog item for root cause / prevention when not fully closed in hotfix.
3. PIR for major incidents per Change/Incident governance.
4. Do not expand hotfix into feature work.
