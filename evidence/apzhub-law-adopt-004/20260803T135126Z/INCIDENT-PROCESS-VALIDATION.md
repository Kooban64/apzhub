# LAW-INCIDENT-MANAGEMENT

| Field             | Value                                  |
| ----------------- | -------------------------------------- |
| Programme         | APZHUB-LAW-ADOPT-004                   |
| Timestamp         | 20260803T135126Z                       |
| Engineering fixes | **NOT authorised inside this process** |
| Pattern           | APZQEP PRODUCTION-INCIDENT-PROCESS     |

## Purpose

Capture, classify, and govern production incidents for APZ Law Platform. Temporary operational mitigations may use existing runbooks. Permanent code fixes require a separate Owner-authorised remediation programme.

## Severity

| Severity | Meaning                                         |
| -------- | ----------------------------------------------- |
| S1       | Service down / data integrity / security breach |
| S2       | Major Law capability degraded for many users    |
| S3       | Limited impact / workaround available           |
| S4       | Minor / cosmetic / single-user                  |

## Required fields

| Field                    | Description                                          |
| ------------------------ | ---------------------------------------------------- |
| Incident ID              | `LAW-INC-YYYYMMDD-NNN`                               |
| Severity                 | S1–S4                                                |
| Affected capability      | Clients / Matters / Trust / Auth / Search / Platform |
| Root cause               | Factual; unknown until known                         |
| Temporary mitigation     | Ops action taken                                     |
| Permanent recommendation | Observation — may propose programme ID               |
| Operational owner        | Named role                                           |
| Status                   | Open / Mitigated / Closed / Escalated to Board       |

## Process

1. Detect (alert, support, health check, user report).
2. Record in Incident Register.
3. Mitigate using existing ops procedures only.
4. Classify feedback class if customer-facing ([LAW-SUPPORT-MODEL.md](./LAW-SUPPORT-MODEL.md)).
5. If code change required → **STOP engineering**; raise Board/Owner programme recommendation.
6. Close only when mitigated or residual accepted (→ Known Issues / Problem).

## Incident register

| Incident ID | Severity | Affected | Root cause | Mitigation | Permanent recommendation | Owner | Status                  |
| ----------- | -------- | -------- | ---------- | ---------- | ------------------------ | ----- | ----------------------- |
| —           | —        | —        | —          | —          | —                        | —     | Empty at programme open |

## Escalation

| Condition                       | Action                                                 |
| ------------------------------- | ------------------------------------------------------ |
| S1 open > 4h                    | Daily Operational Review escalation + Owner notify     |
| Suspected security regression   | Security review path; no silent patch engineering      |
| Requires product change         | Enhancement / remediation programme proposal — no code |
| Cross-product / platform impact | Escalate to Platform Operations + Board liaison        |
