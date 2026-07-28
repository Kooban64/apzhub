# On-call Procedures — Platform 1.2.0

> **Programme:** APZHUB-OPS-002 · **Action:** A6  
> **Monitoring posture:** Manual triage (PL12-KL-02 — no live Observe paging)

## Roles

| Role                         | Responsibility                                              |
| ---------------------------- | ----------------------------------------------------------- |
| **Primary on-call**          | First responder for P1/P2; owns incident bridge             |
| **Secondary on-call**        | Escalation within 30 minutes if primary unavailable         |
| **Service owner (Platform)** | Architecture / Change approvals                             |
| **Owner**                    | Host-disruptive Changes · marketing claims · gated features |

## Severity matrix

| Sev    | Definition                                                | Response       | Escalation                |
| ------ | --------------------------------------------------------- | -------------- | ------------------------- |
| **P1** | Platform unavailable / auth down / data loss risk         | Immediate      | Secondary + Owner if >30m |
| **P2** | Major degradation (single product plane / elevate errors) | ≤ 1h           | Secondary if blocked      |
| **P3** | Minor defect / cosmetic / non-urgent KL                   | Business hours | Backlog                   |

## Contacts (fill at cutover)

| Function          | Contact         | Channel             |
| ----------------- | --------------- | ------------------- |
| Primary on-call   | _TBD at Change_ | Phone / chat        |
| Secondary on-call | _TBD at Change_ | Phone / chat        |
| Platform Owner    | _TBD_           | Named Approval path |

## Alert sources (manual)

1. `/api/health` probe failures (host monitoring / uptime check).
2. Disk / coexistence capacity alerts (thresholds 80%/90%).
3. User reports via Support model.

## P1 procedure (summary)

1. Ack incident · open timeline.
2. Check `/api/health` · compose `ps` · Caddy · Postgres/Redis.
3. Apply matching runbook.
4. Communicate status; escalate per matrix.
5. PIR after restore.
