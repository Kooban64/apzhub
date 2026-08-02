# APZQEP-120-S12 — Product Board Recommendation

| Field        | Value                                                       |
| ------------ | ----------------------------------------------------------- |
| Status       | **SUPERSEDED** — Owner authorised; S12 **COMPLETE** / PASS  |
| Prerequisite | APZQEP-120-S11 Product Board **CERTIFIED**                  |
| Framing      | **Notification & Subscription Platform** (not “send mail”)  |
| Timestamp    | 20260802T155724Z                                            |
| Completed    | 20260802T161211Z — [S12-COMPLETION.md](./S12-COMPLETION.md) |

---

## Framing

Do **not** treat S12 as simply “Notifications.”

Treat S12 as:

> **Notification & Subscription Platform** — subscribe to facts; communicate facts; never query business services for notification content construction.

## Recommended scope

| Capability                | Intent                                   |
| ------------------------- | ---------------------------------------- |
| Subscription Registry     | Who subscribes to which event/projection |
| Notification Preferences  | User/org delivery preferences            |
| Event Subscription Engine | Match facts → subscribers                |
| Delivery Rules            | When/how to notify                       |
| Notification Routing      | Route to channels                        |
| Channel Abstraction       | Pluggable channels                       |
| Template Resolution       | Message shaping                          |
| Delivery Status           | Track outcomes                           |
| Retry Integration         | Via S08/S09 outbox + processing          |
| Audit Trail               | Who was notified, when, why              |

**Initial channel:** internal only. Future channels (email, Teams, Slack, SMS, push, webhooks) via adapters without redesign.

## Platform Architecture Rule (record before S12 starts)

```text
Platform Rule

Notifications SHALL subscribe to the Quality Knowledge Index or Domain Events.

Notifications SHALL NOT invoke business services directly.

Business domains publish facts.

Notification services communicate those facts.
```

This is a **platform architecture rule** — not an Enterprise Standard.

## Critical path (Board)

```text
S01–S11 ✅
  → S12 Notification & Subscription Platform
    → S13 Command Palette
      → S14 Suites → S15 Runs → S16 Execution
        → S17 Defects → S18 Traceability
          → S19 Reporting → S20 Close-out
```

## Authority

S12 requires a formal **Owner Authorisation Pack** before engineering starts.
