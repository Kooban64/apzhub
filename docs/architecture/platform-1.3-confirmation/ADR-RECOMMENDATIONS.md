# ADR Recommendations — Platform 1.3 Architecture Confirmation

> **Programme:** Platform-1.3-ARCH-001  
> **Date:** 2026-07-22  
> **Rule:** ADRs are **produced as Proposed drafts**. They are **not Accepted** and **not implemented** under this programme.

---

## Ruling

| Question                             | Answer                                   |
| ------------------------------------ | ---------------------------------------- |
| Architectural redesign required?     | **No**                                   |
| ADRs required for full 1.3 Must set? | **Yes** (for E02, E03, E04 freeze thaws) |
| ADRs required before ENG-001?        | **No**                                   |

---

## Required ADRs (drafted)

| ID           | File                                                                                                                   | Epic              | Purpose                                                                                                                    |
| ------------ | ---------------------------------------------------------------------------------------------------------------------- | ----------------- | -------------------------------------------------------------------------------------------------------------------------- |
| **ADR-0070** | [ADR-0070-observe-live-alert-evaluation-delivery.md](../../adr/ADR-0070-observe-live-alert-evaluation-delivery.md)     | P13-E02 / ENG-002 | Authorize additive Observe alert evaluation & delivery plane; thaw frozen absence without redesigning Observe metadata SoR |
| **ADR-0071** | [ADR-0071-notification-delivery-provider-framework.md](../../adr/ADR-0071-notification-delivery-provider-framework.md) | P13-E04 / ENG-004 | Authorize Notification delivery providers (APZNOTIFY-007 shape); **explicit fence against Email SoR**                      |
| **ADR-0072** | [ADR-0072-platform-realtime-transport.md](../../adr/ADR-0072-platform-realtime-transport.md)                           | P13-E03 / ENG-003 | Authorize platform-owned SSE/WS transport via Gateway → Platform Services → Event Bus                                      |

---

## Optional / deferred ADRs

| ID       | Purpose                                                        | When                                                                   |
| -------- | -------------------------------------------------------------- | ---------------------------------------------------------------------- |
| ADR-0073 | Time timesheet approval operations (additive TimesheetService) | If ENG-008 needs formal interface expansion beyond CE mapping notes    |
| ADR-0074 | Workflow designer adjacency surfaces without Execute unlock    | If ENG-006 needs freeze-change documentation beyond milestone Approval |

**Not drafted in this programme** — Owner may request drafts at ENG kickoff.

---

## Existing ADRs sufficient (no new ADR)

| Epic              | Governing ADRs                                       |
| ----------------- | ---------------------------------------------------- |
| P13-E01 Search    | ADR-0060…0064 · Search Publication Freeze            |
| P13-E05 Analytics | ADR-0066 · ADR-0067                                  |
| P13-E06–E12       | Existing product/platform ADRs + named ENG Approvals |

---

## Acceptance sequence for required ADRs

1. Owner Architecture Acceptance of ARCH-001 (this pack).
2. Owner may Accept ADR-0070/0071/0072 independently or with ENG Approvals.
3. **Do not implement** ADR decisions until the corresponding **Platform-1.3-ENG-00N** is Owner-approved.
