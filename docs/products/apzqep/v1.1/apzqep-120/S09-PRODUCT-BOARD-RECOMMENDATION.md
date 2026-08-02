# APZQEP-120-S09 — Product Board Recommendation

| Field        | Value                                                       |
| ------------ | ----------------------------------------------------------- |
| Status       | **SUPERSEDED** — Owner authorised; S09 **COMPLETE** / PASS  |
| Prerequisite | APZQEP-120-S08 Product Board **CERTIFIED**                  |
| Framing      | **Execution engine** (not “workers as a product”)           |
| Timestamp    | 20260802T143404Z                                            |
| Completed    | 20260802T144504Z — [S09-COMPLETION.md](./S09-COMPLETION.md) |

---

## Questions answered / to answer

| Slice | Question                                      |
| ----- | --------------------------------------------- |
| S08   | Can we reliably **deliver** events? — **YES** |
| S09   | Can we reliably **process** them? — next      |

## Transition (Board)

```text
Previous foundation work:  Storage → Integrity → Events
Now entering:              Delivery → Processing → Capability
```

After S09, subsequent slices (S10–S20) are predominantly **product functionality**.

## Recommended objective

Authorise **S09 as Reliable Processing — the execution engine**.

S08 guarantees delivery. S09 guarantees processing.

Implement:

- Worker lifecycle
- Reservation
- Leasing
- Acknowledgement
- Retry execution
- Poison message handling
- Replay
- Concurrency control
- Idempotent processing
- Processing metrics

## Processing Contract (pre-S09 architectural concept)

Workers MUST NOT bind directly to business consumers. Define a generic contract:

```text
Event
  → Processor
    → Processing Result
      → Acknowledged
      or Retry
      or Dead Letter
```

| Responsibility  | Owner                      |
| --------------- | -------------------------- |
| What to execute | Product processors (later) |
| How to execute  | Platform execution engine  |
| Delivery        | `@apzhub/platform-outbox`  |

Later processors (each a consumer of the contract, not of the engine internals):

- Search (S11)
- Notifications (S12)
- Quality Intelligence / AI (later)
- Other product capabilities

The execution engine never knows **what** it is executing — only **how** to execute reliably.

## Explicit exclusions (Board)

Do **not** implement business consumers in S09:

- Search (S11)
- Notifications (S12)
- Command Palette (S13)
- Suites / Runs / Execution / Defects (S14–S17)
- Quality Intelligence / AI
- Speculative product features

## Critical path (Board)

```text
S01–S08 ✅
  → S09 Reliable Processing (execution engine)
    → S10 Operational Processing
      → S11 Search
      → S12 Notifications
      → S13 Command Palette
        → S14 Suites → S15 Runs → S16 Execution
          → S17 Defects → S18 Traceability
            → S19 Reporting → S20 Close-out
```

## Authority

Board recommends authorisation of S09 as the next critical-path slice — **one slice, one objective, one certification, no speculative implementation**.

S09 still requires a formal **Owner Authorisation Pack** (`Status: AUTHORISED`) before engineering starts.
