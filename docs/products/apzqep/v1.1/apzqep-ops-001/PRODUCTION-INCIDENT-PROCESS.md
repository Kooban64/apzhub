# PRODUCTION-INCIDENT-PROCESS

| Field             | Value                                  |
| ----------------- | -------------------------------------- |
| Programme         | APZQEP-OPS-001                         |
| Timestamp         | 20260803T072224Z                       |
| Engineering fixes | **NOT authorised inside this process** |

## Purpose

Capture, classify, and govern production incidents. Temporary operational mitigations may be applied per runbooks. Permanent code fixes require a separate Owner-authorised remediation programme.

## Severity

| Severity | Meaning                                         |
| -------- | ----------------------------------------------- |
| S1       | Service down / data integrity / security breach |
| S2       | Major capability degraded for many users        |
| S3       | Limited impact / workaround available           |
| S4       | Minor / cosmetic / single-user                  |

## Required fields (every incident)

| Field                    | Description                                    |
| ------------------------ | ---------------------------------------------- |
| Incident ID              | `INC-YYYYMMDD-NNN`                             |
| Severity                 | S1–S4                                          |
| Affected capability      | Platform / Cap A–F / Auth / Ops                |
| Root cause               | Factual; unknown until known                   |
| Temporary mitigation     | Ops action taken                               |
| Permanent recommendation | Observation — may propose programme ID         |
| Operational owner        | Named role/person                              |
| Status                   | Open / Mitigated / Closed / Escalated to Board |

## Process

1. Detect (alert, support, health check).
2. Record in Incident Register (below).
3. Mitigate using existing ops procedures only.
4. Classify feedback class if customer-facing.
5. If code change required → **STOP engineering**; raise Board/Owner programme recommendation.
6. Close only when mitigated or accepted with residual.

## Incident register

| Incident ID | Severity | Affected | Root cause | Mitigation | Permanent recommendation | Owner | Status                  |
| ----------- | -------- | -------- | ---------- | ---------- | ------------------------ | ----- | ----------------------- |
| —           | —        | —        | —          | —          | —                        | —     | Empty at programme open |

## Escalation

| Condition                     | Action                                                 |
| ----------------------------- | ------------------------------------------------------ |
| S1 open > 4h                  | Daily Operational Review escalation + Owner notify     |
| Suspected security regression | Security review path; no silent patch engineering      |
| Requires product change       | Enhancement / remediation programme proposal — no code |
