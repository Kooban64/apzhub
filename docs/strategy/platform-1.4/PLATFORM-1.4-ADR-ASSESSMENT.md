# Platform 1.4 ADR Assessment

> Architecture Confirmation identifies ADR needs. It does **not** accept ADRs.

| Placeholder                          | Question                                                                                                                           | Urgency         | Prerequisites                 | Affected epics  | Options to evaluate                                                                                                        | Blocked until acceptance |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- | --------------- | ----------------------------- | --------------- | -------------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| **ADR-0073** (proposed)              | How should Notification Delivery persist queue/retry/DLQ and recover across process restart without creating Email SoR?            | High            | ARCH-001 accepted             | E01 · E05 · E06 | (A) Postgres tables from 0065 as SoR runtime (B) Outbox+worker ownership (C) Hybrid retain process-local for non-prod only | Any durable runtime ENG  |
| **ADR-0074** (proposed)              | Which external transactional delivery provider model is authorised for Phase B, and how are credentials/tenant boundaries handled? | Medium          | ADR-0073 · POPIA precondition | E06             | (A) SMTP adapter only (B) Provider-neutral email transactional API (C) Defer external provider                             | External provider ENG    |
| **ADR-0075** (proposed, conditional) | Does multi-instance SSE fan-out require a new shared fan-out component, still without WebSockets?                                  | Low/conditional | Capacity evidence from E02    | Realtime harden | (A) Single-instance sufficient (B) Shared bus fan-out (C) Sticky sessions only                                             | Distributed SSE ENG      |

## Explicitly not proposed as 1.4 ADRs (gates)

| Topic                      | Disposition                           |
| -------------------------- | ------------------------------------- |
| Email SoR                  | No ADR under 1.4 · remain excluded    |
| Workflow Execute           | No unlock ADR under MUST · keep gated |
| FIN-001                    | Remain STOP                           |
| WebSockets / new transport | Prohibited                            |
| Integration SDK thaw       | Prohibited                            |

## Existing ADRs unchanged

ADR-0070 · ADR-0071 · ADR-0072 remain authoritative and are **not** reopened by ARCH-001.
